import type { FitAddon, Terminal } from '@battlefieldduck/xterm-svelte';
interface ITermState {
    terminal: Terminal | null,
    termFitAddon: FitAddon | null,
    canInput: boolean,
}
export const termState = $state<ITermState>({
    terminal: null,
    canInput: false,
    termFitAddon: null,
});
