import { type VarTable, gen_wrapper } from "$lib/run_wrapper";
import type { PyMessage, EditorMessage } from "./pyodide_state.svelte";

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

        const BEANCODE_VERSION = "0.6.0a2";
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

        post({ kind: 'ready' });
        post({ kind: 'output', data: 'Ready.' });
        post({ kind: 'log', data: 'Ready.'});
    }
    pyOK = true;
}

let pyOK = false;
let pyBeancodePromise = loadBeancode();

async function handleRun(src: string) {
    try {
        post({ kind: 'log', data: 'Running Beancode'});
        const t: VarTable = {
            file_name: "___beanweb_file_name",
            src: "___beanweb_src",
            exit_code: "___beanweb_exit_code",
        };
        py.globals.set(t.file_name, "(beanweb)");
        py.globals.set(t.src, src);
        py.globals.set(t.exit_code, 0);
        await py.runPythonAsync(gen_wrapper(t));
        setTimeout(() => {
            post({ kind: 'log', data: 'Ready.'});
        }, 500);
        for (const value of Object.values(t)) {
            await py.runPythonAsync(`del ${value}`);
        }
    } catch (e: any) {
        post({ kind: 'error', data: String(e) });
        setTimeout(() => {
            post({ kind: 'log', data: 'An error occurred.'});
        }, 500);
    }
}

onmessage = async (event: MessageEvent<EditorMessage>) => { 
    await pyBeancodePromise;

    if (!pyOK)
        return;
    
    const msg = event.data;
    switch (msg.kind) {
        case 'run':
            post({ kind: 'clear' });
            await handleRun(msg.data);
            break;
        case 'setup':
            inputBuf = msg.inputBuf;
            interruptBuf = msg.interruptBuf;
            py.setInterruptBuffer(new Uint8Array(interruptBuf));
            break;
    }
}

export {};
