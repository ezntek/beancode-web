<script lang="ts">
	import { Xterm, XtermAddon } from '@battlefieldduck/xterm-svelte';
	import {
		type ITerminalOptions,
		type ITerminalInitOnlyOptions
	} from '@battlefieldduck/xterm-svelte';
	import { termState as ts } from './terminal_state.svelte';
	import { inputBuf } from './state.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		const handleResize = () => {
			ts.termFitAddon!.fit();
		};
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	const options: ITerminalOptions & ITerminalInitOnlyOptions = {
		fontFamily: 'monospace',
		cursorBlink: true
	};

	let terminalContainer: HTMLDivElement;
	let termInputBuf = '';
	const encoder = new TextEncoder();

	const write = (s: string) => ts.terminal?.write(s);

	async function onLoad() {
		ts.termFitAddon = new (await XtermAddon.FitAddon()).FitAddon();
		ts.terminal!.loadAddon(ts.termFitAddon!);
		console.log('Container height:', terminalContainer?.offsetHeight);
		console.log('Container width:', terminalContainer?.offsetWidth);
		requestAnimationFrame(() => {
			ts.termFitAddon!.fit();
			console.log('Terminal rows:', ts.terminal?.rows);
			console.log('Terminal cols:', ts.terminal?.cols);
		});
	}

	function onData(data: string) {
		data;
	}

	function onKey(data: { key: string; domEvent: KeyboardEvent }) {
		if (!ts.canInput) return;
		const ch = data.key;
		switch (ch) {
			case '\r':
				write('\r\n');
				const flag = new Int32Array(inputBuf, 0, 1);
				Atomics.store(flag, 0, termInputBuf.length);
				const sabdata = new Uint8Array(inputBuf, 4);
				// store string as well
				const encoded = encoder.encode(termInputBuf);
				sabdata.set(encoded);
				termInputBuf = '';
				Atomics.notify(flag, 0);
				ts.canInput = false;
				break;
			case '\x7f':
				termInputBuf = termInputBuf.slice(0, -1);
				write('\b \b');
				break;
			case '\u0004':
			case '\u001b[3~':
			case '\u001b[A':
			case '\u001b[B':
			case '\u001b[C':
			case '\u001b[D':
				return;
			default:
				termInputBuf += ch;
				write(ch);
				break;
		}
	}
</script>

<div class="terminal-container" bind:this={terminalContainer}>
	<Xterm bind:terminal={ts.terminal!} {options} {onLoad} {onData} {onKey} />
</div>

<style>
	.terminal-container {
		display: flex;
		flex: 0 0 auto;
		flex-direction: column;
	}

	/* very gross hack*/
	.terminal-container :global(> div) {
		height: 100%;
	}

	.terminal-container :global(.xterm) {
		height: 100% !important;
	}

	.terminal-container :global(.xterm-screen) {
		height: 100% !important;
	}
</style>
