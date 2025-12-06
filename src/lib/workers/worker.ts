let pyodide: any;
async function loadBeancode() {
    if (!pyodide) {
        // @ts-ignore
        const PyodideModule = await import("https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.mjs");

        pyodide = await PyodideModule.loadPyodide({
            stdout: (txt: string) => postMessage({ type: 'output', data: txt })
        });
        postMessage({ type: 'ready' });
        postMessage({ type: 'log', data: 'Ready.'});
    }
}

let pyodideBeancodePromise = loadBeancode();

onmessage = async (event: MessageEvent<any>) => { 
    await pyodideBeancodePromise;
    postMessage({ type: 'clear' });
    try {
        postMessage({ type: 'log', data: 'Running Python'});
        await pyodide.runPythonAsync(event.data.src);
        setTimeout(() => {
            postMessage({ type: 'log', data: 'Ready.'});
        }, 500);
    } catch (e: any) {
        postMessage({ type: 'output' });
    }
}

export {};
