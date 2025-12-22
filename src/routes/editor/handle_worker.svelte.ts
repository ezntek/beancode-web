import type { EditorMessage, PyMessage } from '$lib/workers/pyodide_state.svelte';
import { post, pyState as ps } from '$lib/workers/pyodide_state.svelte';

import { termState as ts } from './terminal_state.svelte';

import { s, inputBuf, interruptBuf, readFileCallback } from './state.svelte';
import { FileResponseKind } from '$lib/fstypes';

function handleWorkerEvent(event: MessageEvent<PyMessage>) {
    let ter = ts.terminal!;
    const msg = event.data;
    let rkind: any;
    switch (msg.kind) {
        case 'ready':
            ps.ready = true;
            s.running = false;
            ts.canInput = false;
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
            s.running = false;
            ts.canInput = false;
            s.exitCode = msg.code;
            break;
        case 'listdir-response':
            s.curdir = msg.data;
            break;
        case 'readfile-response':
            rkind = msg.data.kind;
            if (rkind === FileResponseKind.Ok) {
                // @ts-ignore
                readFileCallback!(msg.path, msg.data.data);
            }
            break;
        case 'newfile-response':
            rkind = msg.data.kind;
            if (rkind === FileResponseKind.Ok) {
                post({ kind: 'listdir', path: s.cwd });
            } else {
                console.error(msg.data);
            }
            break;
    }
}

export async function setupWorker() {
    const W = await import('$lib/workers/pyodide.ts?worker');
    ps.worker = new W.default();
    ps.worker.onmessage = handleWorkerEvent;
    ps.worker.postMessage({ kind: 'setup', inputBuf, interruptBuf } as EditorMessage);
    ps.worker.postMessage({ kind: 'listdir', path: s.cwd } as EditorMessage);
};
