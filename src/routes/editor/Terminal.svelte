<script lang="ts">
	import { Xterm, XtermAddon } from '@battlefieldduck/xterm-svelte';
	import {
		type ITerminalOptions,
		type ITerminalInitOnlyOptions
	} from '@battlefieldduck/xterm-svelte';
	import { termState as ts } from './terminal_state.svelte';
	import { inputBuf, s } from './state.svelte';
	import { onMount } from 'svelte';
	import { type ITheme } from '@xterm/xterm';
	import { THEMES, type ThemeSpec } from '$lib/themes/themes';

	onMount(() => {
		const handleResize = () => {
			ts.termFitAddon!.fit();
		};
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	function hexToEsc(code: string): string {
		const r = parseInt(code.slice(1, 3), 16);
		const g = parseInt(code.slice(3, 5), 16);
		const b = parseInt(code.slice(5, 7), 16);
		return `\x1b[38;2;${r};${g};${b}m`;
	}

	// @ts-ignore
	const t: ThemeSpec = THEMES[s.themeName];
	const termTheme: ITheme = {
		background: hexToEsc(t.base3),
		black: hexToEsc(t.base3),
		red: hexToEsc(t.red),
		green: hexToEsc(t.green),
		yellow: hexToEsc(t.yellow),
		blue: hexToEsc(t.blue),
		magenta: hexToEsc(t.magenta),
		cyan: hexToEsc(t.cyan),
		white: hexToEsc(t.text),
		brightRed: hexToEsc(t.brightRed),
		brightGreen: hexToEsc(t.brightGreen),
		brightYellow: hexToEsc(t.brightYellow),
		brightBlue: hexToEsc(t.brightBlue),
		brightMagenta: hexToEsc(t.brightMagenta),
		brightCyan: hexToEsc(t.brightCyan),
		brightBlack: hexToEsc(t.surface1),
		brightWhite: hexToEsc(t.text)
	};
	console.log(termTheme);

	const options: ITerminalOptions & ITerminalInitOnlyOptions = {
		fontFamily: 'IBM Plex Mono',
		cursorBlink: true,
		fontSize: 24,
		theme: termTheme
	};

	let terminalContainer: HTMLDivElement;
	let termInputBuf = '';
	const encoder = new TextEncoder();

	const write = (s: string) => ts.terminal?.write(s);

	async function onLoad() {
		ts.termFitAddon = new (await XtermAddon.FitAddon()).FitAddon();
		ts.terminal!.loadAddon(ts.termFitAddon!);
		ts.terminal!.options.theme = termTheme;

		setTimeout(() => {
			ts.termFitAddon!.fit();
		}, 0);
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
