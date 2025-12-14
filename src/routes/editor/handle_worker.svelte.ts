import { type EditorMessage, type PyMessage } from '$lib/workers/pyodide_state.svelte';
import { pyState as ps } from '$lib/workers/pyodide_state.svelte';

import { termState as ts } from './terminal_state.svelte';

import { s, sab } from './state.svelte';

function handleWorkerEvent(event: MessageEvent<PyMessage>) {
    let ter = ts.terminal!;
    const msg = event.data;
    switch (msg.kind) {
        case 'ready':
            ps.ready = true;
            ter.write('\x1b[2J\x1b[H')
            break;
        case 'clear':
            ter.write('\x1b[2J\x1b[H')
            break;
        case 'output':
            ter.writeln(String(msg.data).replaceAll("\n", "\r\n"));
            break;
        case 'log':
            s.log = msg.data;
            break;
        case 'error':
            ter.writeln('An error occurred whilst trying to interact with beancode:');
            ter.writeln(String(msg.data).replaceAll("\n", "\r\n"));
            break;
        case 'pyout':
            ter.write(msg.data);
            break;
        case 'pyin':
            ts.canInput = true;
            console.log("sent input"); 
            break;
    }
}

export async function setupWorker() {
    const W = await import('$lib/workers/pyodide.ts?worker');
    ps.worker = new W.default();
    ps.worker.onmessage = handleWorkerEvent;
    ps.worker.postMessage({ kind: 'setup', data: sab });
};
