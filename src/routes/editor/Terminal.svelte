<script lang="ts">
	import { Xterm, XtermAddon } from '@battlefieldduck/xterm-svelte';
	import {
		type ITerminalOptions,
		type ITerminalInitOnlyOptions
	} from '@battlefieldduck/xterm-svelte';
	import { termState } from './terminal_state.svelte';

	const options: ITerminalOptions & ITerminalInitOnlyOptions = {
		fontFamily: 'monospace',
		cursorBlink: true
	};

	async function onLoad() {
		console.log('child component has loaded');

		const fitAddon = new (await XtermAddon.FitAddon()).FitAddon();
		termState.terminal?.loadAddon(fitAddon);
		fitAddon.fit();
		termState.terminal?.writeln('Terminal loaded successfully');
	}

	function onData(data: string) {
		data;
		//if (data == '\r') termState.terminal.writeln('');
		//termState.terminal.write(data);
	}

	function onKey(data: { key: string; domEvent: KeyboardEvent }) {
		data;
		//console.log('key: ', data);
	}
</script>

<Xterm bind:terminal={termState.terminal!} {options} {onLoad} {onData} {onKey} />
