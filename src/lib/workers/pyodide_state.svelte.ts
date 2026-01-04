import type { FileResponse, Dir } from '$lib/fstypes';
import type { TracerConfig } from '$lib/tracer';

export type PyMessage =
    | { kind: 'ready', version: string }
    | { kind: 'clear' }
    | { kind: 'output', data: string }
    | { kind: 'status', data: string, positive: boolean }
    | { kind: 'error', data: string }
    | { kind: 'beanerror', data: BeanError }
    | { kind: 'pyout', data: string }
    | { kind: 'pyin' }
    | { kind: 'pyexit', code: number }
    | { kind: 'listdir-response', data: Dir }
    // path that file was read from
    | { kind: 'readfile-response', path: string, data: FileResponse<string> }
    | { kind: 'newfile-response', path: string, data: FileResponse<string> }
    | { kind: 'delfile-response', path: string }
    // fileresponse ok data contains new path, path contains old path
    | { kind: 'renamefile-response', path: string, data: FileResponse<string> }
    // null: error
    | { kind: 'format-response', data: string | null, path: string }
    | { kind: 'trace-response', data: string | null }
    | { kind: 'compressdir-response', path: string, data: FileResponse<Blob> }

export type EditorMessage = 
    | { kind: 'run', data: string, path: string }
    | { kind: 'runpy', data: string, path: string }
    | { kind: 'setup', inputBuf: SharedArrayBuffer, interruptBuf: SharedArrayBuffer }
    | { kind: 'listdir', path: string }
    | { kind: 'readfile', path: string }
    | { kind: 'newfile', path: string, contents: string, overwrite: boolean }
    | { kind: 'delfile', path: string }
    | { kind: 'renamefile', oldpath: string, newpath: string }
    | { kind: 'format', data: string, path: string }
    | { kind: 'trace', data: string, path: string, vars: string[], config: TracerConfig }
    | { kind: 'compressdir', path: string }

 
export interface BeanError {
    msg: string,
    from: number | null,
    to: number | null,
}

interface IPyState {
    ready: boolean,
    worker: Worker | null,
    curError: BeanError | null,
}

export const ps: IPyState = $state({
    ready: false,
    worker: null,
    curError: null,
})

export function post(msg: EditorMessage) {
    ps.worker!.postMessage(msg);
}
