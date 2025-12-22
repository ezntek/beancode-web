import type { FileResponse, Dir } from '$lib/fstypes';

export type PyMessage =
    | { kind: 'ready', version: string }
    | { kind: 'clear' }
    | { kind: 'output', data: string }
    | { kind: 'status', data: string, positive: boolean }
    | { kind: 'error', data: string }
    | { kind: 'pyout', data: string }
    | { kind: 'pyin' }
    | { kind: 'pyexit', code: number }
    | { kind: 'listdir-response', data: Dir }
    // path that file was read from
    | { kind: 'readfile-response', path: string, data: FileResponse }
    | { kind: 'newfile-response', data: FileResponse }

export type EditorMessage = 
    | { kind: 'run', data: string }
    | { kind: 'runpy', data: string }
    | { kind: 'setup', inputBuf: SharedArrayBuffer, interruptBuf: SharedArrayBuffer }
    | { kind: 'listdir', path: string }
    | { kind: 'readfile', path: string }
    | { kind: 'newfile', path: string, contents: string, overwrite: boolean }

 
interface IPyState {
    ready: boolean,
    worker: Worker | null,
}

export const pyState: IPyState = $state({
    ready: false,
    worker: null,
})

export function post(msg: EditorMessage) {
    pyState.worker!.postMessage(msg);
}
