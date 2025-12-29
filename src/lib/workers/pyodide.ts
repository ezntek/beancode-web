import { FileResponseKind, pathBasename, pathJoin, strerror, type Dir } from "$lib/fstypes";
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
let FS: any;

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
    let dir: Dir = new Map(); 
    const listing = FS.readdir(path);
    for (const item of listing) {
        const itemPath = pathJoin(path, item);
        const stat = FS.stat(itemPath);
        dir.set(item, FS.isDir(stat.mode));
    }
    cwd = pathJoin(path);
    py.globals.set("newcwd", cwd);
    py.runPython("os.chdir(newcwd);del newcwd");
    return dir;
}

function getFileResponseFromException(exc: any): FileResponse {
    if (typeof exc.errno !== 'number') {
        return { kind: FileResponseKind.Exception, data: exc };
    }

    if (exc.errno === 2) {
        return { kind: FileResponseKind.NotFound };
    } else if (exc.errno === 21) {
        return { kind: FileResponseKind.IsDir };
    } else {
        return { kind: FileResponseKind.Errno, errno: exc.errno, msg: strerror(exc.errno) };
    }
}

function readFile(path: string): FileResponse {
    let data: Uint8Array;
    let decoded: string;

    try { 
        data = FS.readFile(path);
    } catch (exc: any) {
        return getFileResponseFromException(exc);
    }

    const decoder = new TextDecoder('utf-8', { fatal: true });

    try {
        decoded = decoder.decode(data);
    } catch (exc: any) {
        return { kind: FileResponseKind.NotText };
    }

    return { kind: FileResponseKind.Ok, data: decoded };
}

function newFile(path: string, contents: string, overwrite: boolean): FileResponse {
    if (FS.analyzePath(path).exists && !overwrite) {
        return { kind: FileResponseKind.AlreadyExists };
    }

    let stream: any;
    try {
        stream = FS.writeFile(path, contents);
    } catch (exc: any) {
        return getFileResponseFromException(exc);
    }

    return { kind: FileResponseKind.Ok, data: "" };
}

function delPath(path: string) {
    if (!FS.analyzePath(path).exists)
        return;

    try {
        if (FS.isDir(path)) {
            // we have python anyway :shrug:
            py.runPython(`import shutil;shutil.rmtree(${path})`);    
        } else {
            FS.unlink(path);
        }
    } catch (e) {
        return getFileResponseFromException(e);
    }
}

function renamePath(oldpath: string, newpath: string): FileResponse {
    try {
        FS.rename(oldpath, newpath);
    } catch (e) {
        return getFileResponseFromException(e);    
    } 
    return { kind: FileResponseKind.Ok, data: newpath };
}

async function doInitialSetupCheck() {
    if (!FS.analyzePath("/data/projects").exists)
        FS.mkdirTree("/data/projects");

    // TODO: remove
    if (!FS.analyzePath("/data/projects/default").exists)
        FS.mkdirTree("/data/projects/default");

    const res = await fetch("/bcdata/utils.py?url");
    if (!res.ok) {
        throw new Error(`could not fetch beancode utilities: ${res.status}`);
    }
    const FNS = await res.text();

    await py.runPythonAsync(FNS);
}

let py: any;
async function loadBeancode() {
    if (!py) {
        // @ts-ignore
        const PyodideModule = await import("/pyodide/pyodide.mjs?url");
        // @ts-ignore
        py = await PyodideModule.loadPyodide({});
        FS = py.FS;

        FS.mkdirTree("/data");
        FS.mount(FS.filesystems.IDBFS, {}, "/data");
        await FS.syncfs(true);

        await py.loadPackage("micropip");

        const BEANCODE_VERSION = "0.7.0b1";
        const PATH = `/bcdata/beancode-${BEANCODE_VERSION}-py3-none-any.whl`
        const SCRIPT = `import micropip,os;await micropip.install(\"${PATH}\");from beancode.runner import *;from beancode import __version__`
        try {
            await py.runPythonAsync(SCRIPT)
        } catch (e) {
            post({ kind: 'error', data: String(e) });
            pyOK = false; 
            return;
        }

        await doInitialSetupCheck();

        py.setStdout(new XtermWriter());
        py.setStderr(new XtermWriter());
        py.setStdin(new XtermStdinHandler());

        const version = py.globals.get("__version__")
        post({ kind: 'ready', version: version });
        post({ kind: 'output', data: 'Ready' });
        post({ kind: 'status', data: 'Ready', positive: true });
    }
    pyOK = true;
    FS.syncfs(false);
}

let pyOK = false;
let pyBeancodePromise = loadBeancode();
let cwd = "/data/projects";

async function handleRun(src: string, path: string) {
    try {
        post({ kind: 'status', data: 'Running Beancode', positive: true});
        py.globals.set("n", pathBasename(path) || "(beanweb)");
        py.globals.set("s", src);
        py.globals.set("c", 0);
        await py.runPythonAsync("c=exec_user_bean(s,n)");
        const exit_code = py.globals.get("c");
        post({ kind: 'pyexit', code: exit_code });
        setTimeout(() => {
            post({ kind: 'status', data: 'Ready', positive: true });
        }, 500);
        await py.runPythonAsync("del(s,n,c)");
    } catch (e: any) {
        post({ kind: 'error', data: String(e) });
        setTimeout(() => {
            post({ kind: 'status', data: 'An error occurred', positive: false });
        }, 500);
        post({ kind: 'pyexit', code: 1 });
    }
}

async function handleRunPy(src: string, name: string){
    try {
        post({ kind: 'status', data: 'Running Python', positive: true});
        py.globals.set("s", src);
        py.globals.set("n", name);
        await py.runPythonAsync("c=exec_user_py(s,n)");
        const exit_code = py.globals.get("c");
        await py.runPythonAsync("del(s,n,c)");
        post({ kind: 'pyexit', code: exit_code });
    } catch (e: any) {
        post({ kind: 'error', data: String(e) });
        post({ kind: 'pyexit', code: 1 });
    }
}

async function formatBean(src: string, path: string): Promise<string | null> {
    try {
        py.globals.set("s", src);
        py.globals.set("n", pathBasename(path));
        await py.runPythonAsync("r=format_bean(s,n)");
        const res = py.globals.get("r");
        await py.runPythonAsync("del(s,n,r)");
        // @ts-ignore
        return res;
    } catch (e: any) {
        post({ kind: 'error', data: String(e) });
    }
    return null;
}

onmessage = async (event: MessageEvent<EditorMessage>) => { 
    try {
        await pyBeancodePromise;

        if (!pyOK)
            return;
    
        const msg = event.data;
        switch (msg.kind) {
            case 'run':
                (new Uint8Array(interruptBuf))[0] = 0;
                post({ kind: 'clear' });
                await handleRun(msg.data, msg.path);
                break;
            case 'runpy':
                (new Uint8Array(interruptBuf))[0] = 0;
                post({ kind: 'clear' });
                await handleRunPy(msg.data, msg.path);
                break;
            case 'setup':
                inputBuf = msg.inputBuf;
                interruptBuf = msg.interruptBuf;
                py.setInterruptBuffer(new Uint8Array(interruptBuf));
                break;
            case 'listdir':
                post({ kind: 'listdir-response', data: listDir(msg.path) });
                break;
            case 'readfile':
                post({ kind: 'readfile-response', path: msg.path, data: readFile(msg.path) });
                break;
            case 'newfile':
                post({ kind: 'newfile-response', path: msg.path, data: newFile(msg.path, msg.contents, msg.overwrite) });
                break;
            case 'delfile':
                delPath(msg.path);
                post({ kind: 'delfile-response', path: msg.path});
                break;
            case 'renamefile':
                post({ kind: 'renamefile-response', path: msg.oldpath, data: renamePath(msg.oldpath, msg.newpath) });
                break;
            case 'format':
                post({ kind: 'format-response', data: await formatBean(msg.data, msg.path) });
        }
    } catch (exc: any) {
        console.error("worker error: ", exc);
        let data = String(exc);
        if (exc.name === "ErrnoError") {
            data = `Errno ${exc.errno}`;
        }

        post({ kind: 'error', data: data });
    }
    FS.syncfs(false);
}

export {};
