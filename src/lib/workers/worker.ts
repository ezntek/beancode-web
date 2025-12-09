import { type VarTable, gen_wrapper } from "$lib/run_wrapper";

let pyodide: any;
async function loadBeancode() {
    if (!pyodide) {
        // @ts-ignore
        const PyodideModule = await import("https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.mjs");

        pyodide = await PyodideModule.loadPyodide({
            stdout: (txt: string) => postMessage({ type: 'output', data: txt }),
        });
        await pyodide.loadPackage("micropip")

        const BEANCODE_VERSION = "0.6.0a1";
        const PATH = `/bcdata/beancode-${BEANCODE_VERSION}-py3-none-any.whl`
        const SCRIPT = `import micropip
await micropip.install(\"${PATH}\")
from beancode.runner import *`
        try {
            await pyodide.runPythonAsync(SCRIPT)
        } catch (e) {
            postMessage({ type: 'error', data: e });
            pyodideOK = false; 
            return;
        }

        postMessage({ type: 'ready' });
        postMessage({ type: 'log', data: 'Ready.'});
    }
    pyodideOK = true;
}

let pyodideOK = false;
let pyodideBeancodePromise = loadBeancode();

onmessage = async (event: MessageEvent<any>) => { 
    await pyodideBeancodePromise;

    if (!pyodideOK)
        return;

    postMessage({ type: 'clear' });
    try {
        postMessage({ type: 'log', data: 'Running Beancode'});
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
            postMessage({ type: 'log', data: 'Ready.'});
        }, 500);
    } catch (e: any) {
        postMessage({ type: 'error', data: String(e) });
        setTimeout(() => {
            postMessage({ type: 'log', data: 'An error occurred.'});
        }, 500);
    }
}

export {};
