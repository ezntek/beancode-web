import { type VarTable, gen_beancode_wrapper, gen_py_wrapper } from "$lib/run_wrapper";
import { FileResponseKind, type Dir } from "$lib/fstypes";
import type { PyMessage, EditorMessage } from "./pyodide_state.svelte";
import type { FileResponse } from "$lib/fstypes";

function post(msg: PyMessage) {
    postMessage(msg satisfies PyMessage);
}

class XtermWriter {
    isatty: boolean

    constructor() {
        this.isatty = true;
    }
    
    write(buf: Uint8Array) {
        let text = new TextDecoder("utf-8").decode(buf)
        text = text.replaceAll("\n", "\r\n");
        post({ kind: 'pyout', data: text });
        return buf.length;
    }
}

let inputBuf: SharedArrayBuffer;
let interruptBuf: SharedArrayBuffer;

class XtermStdinHandler {
    isatty: boolean

    constructor() {
        this.isatty = true;
    }

    stdin = (): string => {
        post({ kind: 'pyin' });
        const flag = new Int32Array(inputBuf, 0, 1);
        const buf = new Uint8Array(inputBuf, 4); 
        Atomics.wait(flag, 0, 0);
        if (flag[0] == 0) {
            // KeyboardInterrupt
            flag.fill(0);
            buf.fill(0);
            post({ kind: 'output', data: '' });
            return "";
        }
        const sliced = buf.slice(0, flag[0]);
        const res = new TextDecoder('utf-8').decode(sliced);
        Atomics.store(flag, 0, 0);
        buf.fill(0);
        return res;
    }
}

function listDir(path: string): Dir {
    let fs: Dir = new Map(); 
    const listing = py.FS.readdir(path);
    console.log("got listing: ", listing);
    for (const item of listing) {
        const itemPath = path + '/' + item;
        const stat = py.FS.stat(itemPath);
        fs.set(item, py.FS.isDir(stat.mode));
    }
    return fs;
}

function readFile(path: string): FileResponse {
    let data: Uint8Array;
    let decoded: string;

    try { 
        data = py.FS.readFile(path);
    } catch (exc: any) {
        if (typeof exc.errno !== 'number') {
            return { kind: FileResponseKind.Exception, data: exc };
        }

        if (exc.errno === 2) {
            return { kind: FileResponseKind.NotFound };
        } else if (exc.errno === 21) {
            return { kind: FileResponseKind.IsDir };
        } else {
            return { kind: FileResponseKind.Errno, errno: exc.errno, msg: py.FS.strerror(exc.errno) };
        }
    }

    const decoder = new TextDecoder('utf-8', { fatal: true });

    try {
        decoded = decoder.decode(data);
    } catch (exc: any) {
        return { kind: FileResponseKind.NotText };
    }

    return { kind: FileResponseKind.Ok, data: decoded };
}

let py: any;
async function loadBeancode() {
    if (!py) {
        // @ts-ignore
        const PyodideModule = await import("https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.mjs");
        py = await PyodideModule.loadPyodide({ args: [/*'-u'*/] });
        py.setStdout(new XtermWriter());
        py.setStderr(new XtermWriter());
        py.setStdin(new XtermStdinHandler());
        await py.loadPackage("micropip")

        const BEANCODE_VERSION = "0.7.0a1";
        const PATH = `/bcdata/beancode-${BEANCODE_VERSION}-py3-none-any.whl`
        const SCRIPT = `import micropip
await micropip.install(\"${PATH}\")
from beancode.runner import *
from beancode import __version__
print(f"loaded beancode {__version__}")`
        try {
            await py.runPythonAsync(SCRIPT)
        } catch (e) {
            post({ kind: 'error', data: String(e) });
            pyOK = false; 
            return;
        }

        const version = py.globals.get("__version__")
        post({ kind: 'ready', version: version });
        post({ kind: 'output', data: 'Ready' });
        post({ kind: 'status', data: 'Ready' });
    }
    pyOK = true;
}

let pyOK = false;
let pyBeancodePromise = loadBeancode();

async function handleRun(src: string) {
    try {
        post({ kind: 'status', data: 'Running Beancode'});
        const t: VarTable = {
            file_name: "___beanweb_file_name",
            src: "___beanweb_src",
            exit_code: "___beanweb_exit_code",
        };
        py.globals.set(t.file_name, "(beanweb)");
        py.globals.set(t.src, src);
        py.globals.set(t.exit_code, 0);
        await py.runPythonAsync(gen_beancode_wrapper(t));
        const exit_code = py.globals.get(t.exit_code);
        post({ kind: 'pyexit', code: exit_code });
        setTimeout(() => {
            post({ kind: 'status', data: 'Ready'});
        }, 500);
        for (const value of Object.values(t)) {
            await py.runPythonAsync(`del ${value}`);
        }
    } catch (e: any) {
        post({ kind: 'error', data: String(e) });
        setTimeout(() => {
            post({ kind: 'status', data: 'An error occurred'});
        }, 500);
    }
}

async function handleRunPy(src: string){
    try {
        post({ kind: 'status', data: 'Running Python'});
        const t: VarTable = {
            file_name: "___beanweb_file_name",
            src: src,
            exit_code: "___beanweb_exit_code",
        };
        await py.runPythonAsync(gen_py_wrapper(t));
        setTimeout(() => {
            post({ kind: 'status', data: 'Ready'});
        }, 500);
    } catch (e: any) {
        post({ kind: 'error', data: String(e) });
        setTimeout(() => {
            post({ kind: 'status', data: 'An error occurred'});
        }, 500);
    }
}

onmessage = async (event: MessageEvent<EditorMessage>) => { 
    await pyBeancodePromise;

    if (!pyOK)
        return;
    
    try {
        const msg = event.data;
        switch (msg.kind) {
            case 'run':
                (new Uint8Array(interruptBuf))[0] = 0;
                post({ kind: 'clear' });
                await handleRun(msg.data);
                break;
            case 'runpy':
                (new Uint8Array(interruptBuf))[0] = 0;
                post({ kind: 'clear' });
                await handleRunPy(msg.data);
                break;
            case 'setup':
                inputBuf = msg.inputBuf;
                interruptBuf = msg.interruptBuf;
                py.setInterruptBuffer(new Uint8Array(interruptBuf));
                break;
            case 'listdir':
                post({ kind: 'listdir-response', data: listDir(msg.path) });
                break
            case 'readfile':
                post({ kind: 'readfile-response', path: msg.path, data: readFile(msg.path) });
                break;
        }
    } catch (exc: any) {
        console.error("worker error: ", exc);
        let data = String(exc);
        if (exc.name === "ErrnoError") {
            data = `Errno ${exc.errno}`;
        }

        post({ kind: 'error', data: data });
    }
}

export {};
