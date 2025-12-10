import { type Terminal } from '@battlefieldduck/xterm-svelte';
interface ITermState {
    terminal: Terminal | null,
}
export const termState = $state<ITermState>({
    terminal: null,
});
