import { type PyMessage } from '$lib/workers/pyodide_state.svelte';
import { pyState } from '$lib/workers/pyodide_state.svelte';

import { termState } from './terminal_state.svelte';

import { s } from './state.svelte';

function handleWorkerEvent(event: MessageEvent<PyMessage>) {
    let terminal = termState.terminal!;
    const msg = event.data;
    switch (msg.kind) {
        case 'ready':
            pyState.ready = true;
            terminal.write('\x1b[2J\x1b[H')
            break;
        case 'clear':
            terminal.write('\x1b[2J\x1b[H')
            break;
        case 'output':
            terminal.writeln(String(msg.data).replaceAll("\n", "\r\n"));
            break;
        case 'log':
            s.log = msg.data;
            break;
        case 'error':
            terminal.writeln('An error occurred whilst trying to interact with beancode:');
            terminal.writeln(String(msg.data).replaceAll("\n", "\r\n"));
            break;
        case 'pystdout':
            terminal.write(msg.data);
            break;
    }
}

export async function setupWorker() {
    const W = await import('$lib/workers/pyodide.ts?worker');
    pyState.worker = new W.default();
    pyState.worker.onmessage = handleWorkerEvent;
};
