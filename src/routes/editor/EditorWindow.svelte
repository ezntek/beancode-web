<script lang="ts">
	import { setupWorker } from './handle_worker.svelte';
	import { onMount } from 'svelte';
	import Terminal from './Terminal.svelte';
	import { pyState } from '$lib/workers/pyodide_state.svelte';
	import { interruptBuf, s } from './state.svelte';
	import { termState as ts } from './terminal_state.svelte';
	import Editor from './Editor.svelte';

	let terminalWidth = $state(400);
	let terminalShown = $state(true);
	let ibuf: Uint8Array;

	onMount(async () => {
		await setupWorker();
		s.log = 'Waiting to launch';
		ibuf = new Uint8Array(interruptBuf);

		const width = localStorage.getItem('EditorTerminalWidth');
		if (width !== null) terminalWidth = Number.parseInt(width);
	});

	async function loadExample(ex: string) {
		const FILE_NAME = `${ex}.bean`;
		const res = await fetch(`/bcdata/examples/${FILE_NAME}`);
		if (res.status === 200) {
			s.editorSrc = await res.text();
			s.log = `loaded example ${FILE_NAME}`;
		} else {
			s.log = `could not load example ${FILE_NAME}`;
		}
	}

	function run() {
		ibuf[0] = 0;
		pyState.worker!.postMessage({ kind: 'run', data: s.editorSrc });
	}

	function clear() {
		s.editorSrc = '';
		ts.terminal!.write('\x1b[2J\x1b[H');
	}

	function stop() {
		// SIGINT
		ibuf[0] = 2;
	}

	const MIN_RATIO = 0.1;
	const MAX_RATIO = 0.5;

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

	function toggleTerminal() {
		terminalShown = !terminalShown;
	}
</script>

<div class="outer">
	{#if pyState.ready}
		<button onclick={() => run()}>do magic</button>
		<button onclick={() => loadExample('BubbleSort')}>load bubble sort example</button>
		<button onclick={() => loadExample('PrimeTorture')}>load prime torture benchmark</button>
		<button onclick={() => stop()}>stop</button>
		<button onclick={() => clear()}>clear</button>
		<button onclick={() => toggleTerminal()}>toggle terminal</button>
	{:else}
		<p>Loading Beancode</p>
	{/if}
	<div class="main">
		<div class="editor">
			<Editor />
		</div>
		<div class="resize-handle" onpointerdown={startResize}></div>
		<aside class="terminal" style="width: {terminalWidth}px">
			{#if terminalShown}
				<Terminal />
			{:else}
				<div style="background-color: cyan">a</div>
			{/if}
		</aside>
	</div>
	<p>{s.log}</p>
</div>

<style>
	.main {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: space-between;
		align-items: stretch;
		gap: 0.2em;
		height: 90vh;
		overflow: hidden;
	}

	.editor {
		display: flex;
		flex: 1 0 50%;
		flex-direction: column;
		min-width: none;
	}

	.resize-handle {
		flex: 0 0 auto;
		position: relative;
		box-sizing: border-box;
		height: 100%;
		width: 3px;
		cursor: col-resize;
		border-left: 1px solid black;
		border-right: 1px solid black;
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
