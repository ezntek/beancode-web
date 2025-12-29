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

	let fontSize = 22;
	let options: ITerminalOptions & ITerminalInitOnlyOptions;
	onMount(() => {
		const handleResize = () => {
			ts.termFitAddon!.fit();
		};
		window.addEventListener('resize', handleResize);

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

	function clear() {
		write('\x1b[2J\x1b[H');
		ts.terminal!.clear();
	}

	function zoomIn() {
		ts.terminal!.options.fontSize! += 1;
		ts.termFitAddon!.fit();
	}

	function zoomOut() {
		ts.terminal!.options.fontSize! -= 1;
		ts.termFitAddon!.fit();
	}
</script>

<div class="terminal-wrapper">
	<div class="toolbar">
		<p id="terminal-label">TERMINAL</p>
		{#if ts.canInput}
			<button
				class="toolbar-input"
				style="background-color: var(--bw-yellow); color: var(--bw-base1);"
			>
				<strong>waiting for input</strong>
			</button>
		{/if}
		<button aria-label="zoom in" class="toolbar-button zoomout" onclick={() => zoomOut()}>
			<span class="fa-solid fa-minus"></span>
		</button>
		<button aria-label="zoom in" class="toolbar-button zoomin" onclick={() => zoomIn()}>
			<span class="fa-solid fa-plus"></span>
		</button>
		<button class="toolbar-button clear" onclick={clear}>clear</button>
	</div>
	<div class="terminal-container" bind:this={terminalContainer}>
		<Xterm bind:terminal={ts.terminal!} {options} {onLoad} {onData} {onKey} />
	</div>
</div>

<style>
	.terminal-wrapper {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.toolbar {
		background-color: var(--bw-base2);
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-shrink: 0;
	}

	.toolbar-input {
		border: 0px solid black;
		margin: 0.2em;
		color: var(--bw-base1);
		font-family: 'IBM Plex Mono', monospace;
		border-radius: 0.2em;
		overflow: none;
		white-space: nowrap;
	}

	.toolbar-button {
		border: 0px solid black;
		margin: 0.2em;
		color: var(--bw-base1);
		font-family: 'IBM Plex Mono', monospace;
		border-radius: 0.2em;
		transition:
			background-color 130ms ease,
			color 130ms ease,
			font-weight 130ms ease;
	}

	.clear {
		background-color: var(--bw-magenta);
	}

	.clear:hover {
		background-color: var(--bw-surface1);
		color: var(--bw-magenta);
		font-weight: bold;
	}

	.zoomout {
		background-color: var(--bw-red);
	}

	.zoomout:hover {
		background-color: var(--bw-surface1);
		color: var(--bw-red);
	}

	.zoomin {
		background-color: var(--bw-green);
	}

	.zoomin:hover {
		background-color: var(--bw-surface1);
		color: var(--bw-green);
	}

	#terminal-label {
		color: var(--bw-subtext2);
		font-family: 'IBM Plex Mono', monospace;
		padding: 0;
		padding-bottom: 0.1em;
		padding-left: 0.3em;
		padding: 0.3em;
		margin: 0;
		margin-right: auto;
	}

	.terminal-container {
		display: flex;
		flex: 1 1 auto;
		min-height: 0px;
		flex-direction: column;
		height: 100%;
		background-color: var(--bw-base3);
	}

	/* very gross hack*/
	.terminal-container :global(> div) {
		display: flex;
		height: 100%;
		width: 100%;
	}

	.terminal-container :global(.xterm) {
		display: flex;
		height: 100% !important;
	}

	.terminal-container :global(.xterm-screen) {
		display: flex;
		height: 100% !important;
	}
</style>
