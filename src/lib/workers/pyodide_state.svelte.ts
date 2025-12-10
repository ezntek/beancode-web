export interface WorkerMessage {
    type: 'ready' | 'output' | 'clear' | 'log' | 'error';
    data: string;
}
 
interface IPyState {
    ready: boolean,
    worker: Worker | null,
}
export const pyState: IPyState = $state({
    ready: false,
    worker: null,
})
