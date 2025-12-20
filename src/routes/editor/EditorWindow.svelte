<script lang="ts">
	import { onMount } from 'svelte';

	import Editor from './Editor.svelte';
	import Button from '$lib/components/Button.svelte';

	import { setupWorker } from './handle_worker.svelte';
	import Terminal from './Terminal.svelte';
	import { post, pyState as ps } from '$lib/workers/pyodide_state.svelte';
	import {
		inputBuf,
		interruptBuf,
		s,
		setReadFileCallback,
		type ReadFileCallback
	} from './state.svelte';
	import { termState as ts } from './terminal_state.svelte';
	import FileBrowser from './FileBrowser.svelte';
	import ResizeBar from '$lib/components/ResizeBar.svelte';

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

		function readFileCallback(path: string, data: string) {
			path;
			s.editorSrc = data;
		}
		setReadFileCallback(readFileCallback as ReadFileCallback);
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
		post({ kind: 'run', data: s.editorSrc });
	}

	function runPy() {
		post({ kind: 'runpy', data: s.editorSrc });
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

	let terminalWidth = $state(0);
	let fileBrowserWidth = $state(100);

	function startResizeTerm(e: any) {
		const container = e.currentTarget.parentElement;
		const rect = container.getBoundingClientRect();
		const min = rect.width * 0.1;
		const max = rect.width * 0.6;

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
				ts.termFitAddon!.fit();
			}, 0);
		}

		e.target.addEventListener('pointermove', onMove);
		e.target.addEventListener('pointerup', onUp);
	}

	function startResizeFileBrowser(e: any) {
		const container = e.currentTarget.parentElement;
		const rect = container.getBoundingClientRect();
		const min = rect.width * 0.05;
		const max = rect.width * 0.2;

		e.preventDefault();
		const startX = e.clientX;
		const startWidth = fileBrowserWidth;
		e.target.setPointerCapture(e.pointerId);

		function onMove(e: any) {
			const delta = e.clientX - startX;
			fileBrowserWidth = Math.min(max, Math.max(min, startWidth + delta));
		}

		function onUp(e: any) {
			e.target.releasePointerCapture(e.pointerId);
			e.target.removeEventListener('pointermove', onMove);
			e.target.removeEventListener('pointerup', onUp);
			localStorage.setItem('EditorFileBrowserWidth', String(fileBrowserWidth));
		}

		e.target.addEventListener('pointermove', onMove);
		e.target.addEventListener('pointerup', onUp);
	}
</script>

<div class="outer">
	<div class="toolbar">
		{#if ps.ready}
			<Button onclick={run}>do magic</Button>
			<Button onclick={runPy}>run python</Button>
			<Button onclick={stop}>stop</Button>
			<Button onclick={() => loadExample('HelloWorld')}>load some code</Button>
			<Button onclick={clearEditor}>clear editor</Button>
			<Button onclick={clearTerminal}>clear terminal</Button>
		{:else}{/if}
	</div>
	<div class="middle">
		<aside style="display: flex; width: {fileBrowserWidth}px;">
			<FileBrowser />
		</aside>
		<ResizeBar resize={startResizeFileBrowser} />
		<div class="editor">
			<Editor />
		</div>
		<ResizeBar resize={startResizeTerm} />
		<aside class="terminal" style="width: {terminalWidth}px;">
			<Terminal />
		</aside>
	</div>
	<div class="bottom">
		<p style="font-weight: bold;">{s.status}</p>
		<p>{s.versionText}</p>
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
