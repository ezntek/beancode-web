import { type VarTable, gen_wrapper } from "$lib/run_wrapper";
import type { PyMessage } from "./pyodide_state.svelte";

function post(msg: PyMessage) {
    postMessage(msg satisfies PyMessage);
}

class XtermWriter {
    isatty: boolean

    constructor() {
        this.isatty = true;
    }
    
    write(buf: Uint8Array) {
        const text = new TextDecoder("utf-8").decode(buf).replaceAll("\n", "\r\n");
        post({ kind: 'pystdout', data: text });
        return buf.length;
    }
}


let pyodide: any;
async function loadBeancode() {
    if (!pyodide) {
        // @ts-ignore
        const PyodideModule = await import("https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.mjs");
        pyodide = await PyodideModule.loadPyodide({});
        pyodide.setStdout(new XtermWriter());
        pyodide.setStderr(new XtermWriter());
        await pyodide.loadPackage("micropip")

        const BEANCODE_VERSION = "0.6.0a2";
        const PATH = `/bcdata/beancode-${BEANCODE_VERSION}-py3-none-any.whl`
        const SCRIPT = `import micropip
await micropip.install(\"${PATH}\")
from beancode.runner import *
from beancode import __version__
print(f"loaded beancode {__version__}")`
        try {
            await pyodide.runPythonAsync(SCRIPT)
        } catch (e) {
            post({ kind: 'error', data: String(e) });
            pyodideOK = false; 
            return;
        }

        post({ kind: 'ready' });
        post({ kind: 'output', data: 'Ready.' });
        post({ kind: 'log', data: 'Ready.'});
    }
    pyodideOK = true;
}

let pyodideOK = false;
let pyodideBeancodePromise = loadBeancode();

onmessage = async (event: MessageEvent<any>) => { 
    await pyodideBeancodePromise;

    if (!pyodideOK)
        return;

    post({ kind: 'clear' });
    try {
        post({ kind: 'log', data: 'Running Beancode'});
        const t: VarTable = {
            file_name: "___beanweb_file_name",
            src: "___beanweb_src",
            exit_code: "___beanweb_exit_code",
        };
        pyodide.globals.set(t.file_name, "(beanweb)");
        pyodide.globals.set(t.src, event.data.src);
        pyodide.globals.set(t.exit_code, 0);
        await pyodide.runPythonAsync(gen_wrapper(t));
        setTimeout(() => {
            post({ kind: 'log', data: 'Ready.'});
        }, 500);
        for (const value of Object.values(t)) {
            await pyodide.runPythonAsync(`del ${value}`);
        }
    } catch (e: any) {
        post({ kind: 'error', data: String(e) });
        setTimeout(() => {
            post({ kind: 'log', data: 'An error occurred.'});
        }, 500);
    }
}

export {};
