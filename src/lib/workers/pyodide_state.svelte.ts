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
    | { kind: 'newfile-response', path: string, data: FileResponse }
    | { kind: 'delfile-response', path: string }
    | { kind: 'renamefile-response', path: string, data: FileResponse }

export type EditorMessage = 
    | { kind: 'run', data: string, filePath: string }
    | { kind: 'runpy', data: string, filePath: string }
    | { kind: 'setup', inputBuf: SharedArrayBuffer, interruptBuf: SharedArrayBuffer }
    | { kind: 'listdir', path: string }
    | { kind: 'readfile', path: string }
    | { kind: 'newfile', path: string, contents: string, overwrite: boolean }
    | { kind: 'delfile', path: string }
    | { kind: 'renamefile', oldpath: string, newpath: string }

 
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
