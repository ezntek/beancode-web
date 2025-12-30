import type { EditorMessage, PyMessage } from '$lib/workers/pyodide_state.svelte';
import { post, pyState as ps } from '$lib/workers/pyodide_state.svelte';

import { termState as ts } from './terminal_state.svelte';

import { s, inputBuf, interruptBuf, fileResponseCallback, doneTracingCallback, doneFormattingCallback } from './state.svelte';
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
            post({ kind: 'listdir', path: s.cwd });
            break;
        case 'listdir-response':
            const newmap = new Map([...msg.data.entries()].sort(([keyA], [keyB]) =>
              keyA.localeCompare(keyB)
            ));
            s.curdir = newmap;
            break;
        case 'readfile-response':
            rkind = msg.data.kind;
            fileResponseCallback!(msg.kind, msg.path, msg.data);
            break;
        case 'newfile-response':
            rkind = msg.data.kind;
            if (rkind === FileResponseKind.Ok) {
                // gotta update the FS listing on the frontend!
                post({ kind: 'listdir', path: s.cwd });
            }
            fileResponseCallback!(msg.kind, msg.path, msg.data);
            break;
        case 'delfile-response':
            post({ kind: 'listdir', path: s.cwd });
            fileResponseCallback!(msg.kind, msg.path);
            break;
        case 'renamefile-response':
            post({ kind: 'listdir', path: s.cwd });
            fileResponseCallback!(msg.kind, msg.path, msg.data);
            break;
        case 'format-response':
            if (msg.data !== null && msg.data !== '') {
                doneFormattingCallback!(msg.data, msg.path);
            }
            break; 
        case 'trace-response':
            if (msg.data !== null) {
                doneTracingCallback!(msg.data);
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
