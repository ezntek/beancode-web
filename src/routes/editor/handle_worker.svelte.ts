import { type WorkerMessage } from '$lib/workers/pyodide_state.svelte';
import { pyState } from '$lib/workers/pyodide_state.svelte';

import { termState } from './terminal_state.svelte';

import { s } from './state.svelte';

function handleWorkerEvent(event: MessageEvent<WorkerMessage>) {
    console.log(event.data);
    let terminal = termState.terminal!;
    switch (event.data.type) {
        case 'ready':
            pyState.ready = true;
            terminal.clear();
            break;
        case 'clear':
            terminal.clear();
            break;
        case 'output':
            terminal.writeln(String(event.data.data).replace(/\n/g, '\r\n'));
            break;
        case 'log':
            s.log = event.data.data;
            break;
        case 'error':
            terminal.writeln('An error occurred whilst trying to interact with beancode:');
            terminal.writeln(String(event.data.data).replace(/\n/g, '\r\n'));
            break;
    }
}

export async function setupWorker() {
    const W = await import('$lib/workers/pyodide.ts?worker');
    pyState.worker = new W.default();
    pyState.worker.onmessage = handleWorkerEvent;
};
