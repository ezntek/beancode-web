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

	let fontSize = 25;
	let options: ITerminalOptions & ITerminalInitOnlyOptions;
	onMount(() => {
		const handleResize = () => {
			ts.termFitAddon!.fit();
		};
		window.addEventListener('resize', handleResize);

		console.log(window.innerWidth, window.innerHeight);
		if (window.innerWidth <= 1366 || window.innerHeight <= 768) {
			fontSize = 20;
		}

		options = {
			fontFamily: 'IBM Plex Mono',
			cursorBlink: true,
			fontSize: fontSize,
			theme: termTheme
		};

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	// @ts-ignore
	const t: ThemeSpec = THEMES[s.themeName];
	const termTheme: ITheme = {
		background: t.base3,
		foreground: t.text,
		selectionBackground: t.blue,
		cursor: t.text,
		black: t.base3,
		red: t.red,
		green: t.green,
		yellow: t.yellow,
		blue: t.blue,
		magenta: t.magenta,
		cyan: t.cyan,
		white: t.text,
		brightRed: t.brightRed,
		brightGreen: t.brightGreen,
		brightYellow: t.brightYellow,
		brightBlue: t.brightBlue,
		brightMagenta: t.brightMagenta,
		brightCyan: t.brightCyan,
		brightBlack: t.surface1,
		brightWhite: t.text
	};

	let terminalContainer: HTMLDivElement;
	let termInputBuf = '';
	const encoder = new TextEncoder();

	const write = (s: string) => ts.terminal?.write(s);

	async function onLoad() {
		ts.termFitAddon = new (await XtermAddon.FitAddon()).FitAddon();
		ts.terminal!.loadAddon(ts.termFitAddon!);
		ts.terminal!.options.theme = termTheme;
		ts.terminal!.attachCustomKeyEventHandler((data) => {
			if (!data.ctrlKey) {
				return true;
			}
			switch (data.key) {
				case 'c':
					if (!ts.terminal!.hasSelection()) break;
					const sel = ts.terminal!.getSelection();
					window.navigator.clipboard.writeText(sel);
					break;
				case 'v':
					if (!ts.canInput) break;
					window.navigator.clipboard
						.readText()
						.then((data) => {
							if (ts.canInput) {
								ts.terminal!.write(data);
								termInputBuf += data;
							}
						})
						.catch(() => {});
			}
			return false;
		});

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
				if (termInputBuf.length > 0) {
					termInputBuf = termInputBuf.slice(0, -1);
					write('\b \b');
				}
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
