export type PyMessage =
    | { kind: 'ready' }
    | { kind: 'clear' }
    | { kind: 'output', data: string }
    | { kind: 'log', data: string }
    | { kind: 'error', data: string }
    | { kind: 'pyout', data: string }
    | { kind: 'pyin' }

export type EditorMessage = 
    | { kind: 'run', data: string }
    | { kind: 'setup', inputBuf: SharedArrayBuffer, interruptBuf: SharedArrayBuffer }
 
interface IPyState {
    ready: boolean,
    worker: Worker | null,
}

export const pyState: IPyState = $state({
    ready: false,
    worker: null,
})
