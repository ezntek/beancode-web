import { type Terminal } from '@battlefieldduck/xterm-svelte';
interface ITermState {
    terminal: Terminal | null,
    canInput: boolean,
}
export const termState = $state<ITermState>({
    terminal: null,
    canInput: false,
});
