export type PyMessage =
    | { kind: 'ready' }
    | { kind: 'clear' }
    | { kind: 'output', data: string; }
    | { kind: 'log', data: string; }
    | { kind: 'error', data: string; }
    | { kind: 'pystdout', data: string; }
 
interface IPyState {
    ready: boolean,
    worker: Worker | null,
}

export const pyState: IPyState = $state({
    ready: false,
    worker: null,
})
