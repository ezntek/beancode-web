import type { EditorMessage, PyMessage } from '$lib/workers/pyodide_state.svelte';
import { pyState as ps } from '$lib/workers/pyodide_state.svelte';

import { termState as ts } from './terminal_state.svelte';

import { s, inputBuf, interruptBuf } from './state.svelte';

function handleWorkerEvent(event: MessageEvent<PyMessage>) {
    let ter = ts.terminal!;
    const msg = event.data;
    switch (msg.kind) {
        case 'ready':
            ps.ready = true;
            s.versionText = "beancode v" + msg.version;
            ter.write('\x1b[2J\x1b[H')
            break;
        case 'clear':
            ter.write('\x1b[2J\x1b[H')
            break;
        case 'output':
            ter.writeln(String(msg.data).replaceAll("\n", "\r\n"));
            break;
        case 'status':
            s.status = msg.data;
            break;
        case 'error':
            ter.writeln('An error occurred whilst trying to interact with the Python backend:');
            ter.writeln(String(msg.data).replaceAll("\n", "\r\n"));
            break;
        case 'pyout':
            ter.write(msg.data);
            break;
        case 'pyin':
            ts.canInput = true;
            break;
        case 'pyexit':
            s.exitCode = msg.code;
            break;
    }
}

export async function setupWorker() {
    const W = await import('$lib/workers/pyodide.ts?worker');
    ps.worker = new W.default();
    ps.worker.onmessage = handleWorkerEvent;
    ps.worker.postMessage({ kind: 'setup', inputBuf, interruptBuf } as EditorMessage);
};
