<script lang="ts">
	import { onMount } from 'svelte';

	import Editor from './Editor.svelte';
	import Button from '$lib/components/Button.svelte';

	import { setupWorker } from './handle_worker.svelte';
	import Terminal from './Terminal.svelte';
	import { pyState } from '$lib/workers/pyodide_state.svelte';
	import { inputBuf, interruptBuf, s } from './state.svelte';
	import { termState as ts } from './terminal_state.svelte';

	let terminalWidth = $state(0);
	let ibuf: Uint8Array;

	onMount(async () => {
		await setupWorker();
		s.status = 'Waiting to launch';
		ibuf = new Uint8Array(interruptBuf);

		const width = localStorage.getItem('EditorTerminalWidth');
		if (width !== null) {
			terminalWidth = Number.parseInt(width);
		} else {
			terminalWidth = window.innerWidth * 0.45;
		}
	});

	async function loadExample(ex: string) {
		const FILE_NAME = `${ex}.bean`;
		const res = await fetch(`/bcdata/examples/${FILE_NAME}`);
		if (res.status === 200) {
			s.editorSrc = await res.text();
			s.status = `loaded example ${FILE_NAME}`;
		} else {
			s.status = `could not load example ${FILE_NAME}`;
		}
	}

	function run() {
		pyState.worker!.postMessage({ kind: 'run', data: s.editorSrc });
	}

	function runPy() {
		pyState.worker!.postMessage({ kind: 'runpy', data: s.editorSrc });
	}

	function clearEditor() {
		s.editorSrc = '';
	}

	function stop() {
		// SIGINT
		ibuf[0] = 2;
		const flag = new Int32Array(inputBuf, 0, 1);
		Atomics.store(flag, 0, 0);
		Atomics.notify(flag, 0);
	}

	function clearTerminal() {
		ts.terminal!.clear();
		ts.terminal!.write('\x1b[2J\x1b[H');
	}

	const MIN_RATIO = 0.1;
	const MAX_RATIO = 0.9;

	function startResize(e: any) {
		const container = e.currentTarget.parentElement;
		const rect = container.getBoundingClientRect();
		const min = rect.width * MIN_RATIO;
		const max = rect.width * MAX_RATIO;

		e.preventDefault();
		const startX = e.clientX;
		const startWidth = terminalWidth;
		e.target.setPointerCapture(e.pointerId);

		function onMove(e: any) {
			const delta = e.clientX - startX;
			terminalWidth = Math.min(max, Math.max(min, startWidth - delta));
		}

		function onUp(e: any) {
			e.target.releasePointerCapture(e.pointerId);
			e.target.removeEventListener('pointermove', onMove);
			e.target.removeEventListener('pointerup', onUp);
			localStorage.setItem('EditorTerminalWidth', String(terminalWidth));
			setTimeout(() => {
				ts.termFitAddon?.fit();
			}, 0);
		}

		e.target.addEventListener('pointermove', onMove);
		e.target.addEventListener('pointerup', onUp);
	}
</script>

<div class="outer">
	<div class="toolbar">
		{#if pyState.ready}
			<Button onclick={run}>do magic</Button>
			<Button onclick={runPy}>run python</Button>
			<Button onclick={stop}>stop</Button>
			<Button onclick={() => loadExample('HelloWorld')}>load some code</Button>
			<Button onclick={clearEditor}>clear editor</Button>
			<Button onclick={clearTerminal}>clear terminal</Button>
		{:else}{/if}
	</div>
	<div class="middle">
		<div class="editor">
			<Editor />
		</div>
		<div class="resize-handle-outer" onpointerdown={startResize}>
			<div class="resize-handle-line">
				<div class="resize-handle-handle"></div>
			</div>
		</div>
		<aside class="terminal" style="width: {terminalWidth}px">
			<Terminal />
		</aside>
	</div>
	<div class="bottom">
		<p>{s.versionText}</p>
		<p style="font-weight: bold;">{s.status}</p>
	</div>
</div>

<style>
	.outer {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}

	.toolbar {
		display: flex;
	}

	.middle {
		display: flex;
		flex: 1;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: space-between;
		align-items: stretch;
		gap: 0.2em;
		min-height: 0;
		margin-top: 0.3em;
		margin-bottom: 0.3em;
	}

	.bottom {
		flex: 0 0 auto;
		display: flex;
		min-height: 0;
		justify-content: space-between;
	}

	.bottom p {
		color: var(--bw-text);
		font-family: 'IBM Plex Mono', 'monospace';
		font-size: 0.8em;
		margin: 0.2em;
	}

	.editor {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}

	.resize-handle-outer {
		flex: 0 0 auto;
		flex-direction: column;
		position: relative;
		box-sizing: border-box;
		height: 100%;
		width: 8px;
		cursor: col-resize;
		margin-left: 1px;
		margin-right: 1px;
		align-items: center;
		justify-content: center;
		display: flex;
	}

	.resize-handle-line {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--bw-surface1);
		height: 100%;
		width: 3px;
		border-radius: 1px;
		overflow: visible;
	}

	.resize-handle-handle {
		display: flex;
		height: 45px;
		background-color: var(--bw-surface2);
		border-radius: 1px;
		min-width: 6px;
	}

	aside.terminal {
		display: flex;
		flex: 0 0 auto;
		flex-direction: column;
	}

	aside.terminal > :global(*) {
		flex: 1;
		min-height: 0;
	}
</style>
