<script lang="ts">
	import { onMount, tick } from 'svelte';

	import Editor from './Editor.svelte';

	import { BEANCODE_WEB_VERSION } from '$lib/version';

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
	import SaveDialog from '$lib/components/SaveDialog.svelte';
	import MessageDialog from '$lib/components/MessageDialog.svelte';
	import { pathJoin } from '$lib/fstypes';
	import { es } from './editor_state.svelte';

	let ibuf: Uint8Array;
	let terminalWidth = $state(0);
	let fileBrowserWidth = $state(0);
	let saveDialog: SaveDialog;
	let messageDialog: MessageDialog;

	onMount(async () => {
		await setupWorker();
		s.status = 'Waiting to launch';
		ibuf = new Uint8Array(interruptBuf);

		const twidth = localStorage.getItem('EditorTerminalWidth');
		if (twidth !== null) {
			terminalWidth = Number.parseInt(twidth);
		} else {
			terminalWidth = window.innerWidth * 0.3;
		}

		const fbwidth = localStorage.getItem('EditorFileBrowserWidth');
		if (fbwidth !== null) {
			fileBrowserWidth = Number.parseInt(fbwidth);
		} else {
			fileBrowserWidth = window.innerWidth * 0.1;
		}

		function readFileCallback(path: string, data: string) {
			path;
			es.editorSrc = data;
			tick().then(() => {
				es.saved = true;
			});
		}
		setReadFileCallback(readFileCallback as ReadFileCallback);
	});

	function runStop() {
		if (s.running) {
			stop();
			return;
		}

		s.running = true;
		post({ kind: 'run', data: es.editorSrc });
	}

	function stop() {
		// SIGINT
		ibuf[0] = 2;
		const flag = new Int32Array(inputBuf, 0, 1);
		Atomics.store(flag, 0, 0);
		Atomics.notify(flag, 0);
		s.running = false;
		ts.canInput = false;
	}

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

	function buttonStyle(name: string): string {
		switch (name) {
			case 'runstop':
				return s.running ? 'editor-button-stop' : 'editor-button-run';
			default:
				return '';
		}
	}

	function openSaveDialog() {
		if (es.curFileName === '') {
			saveDialog.open();
		} else {
			saveFile(true);
		}
	}

	function saveOk(fileName: string, fileType: string) {
		let name = fileName;
		name += fileType !== '' ? '.' + fileType : '';
		es.curFilePath = pathJoin(s.cwd, name);
		es.curFileName = name;
		saveFile(false);
	}

	function saveFile(overwrite: boolean) {
		post({ kind: 'newfile', path: es.curFilePath, contents: es.editorSrc, overwrite: overwrite });
		es.saved = true;
	}
</script>

<div class="editor-window">
	<div class="outer-wrapper">
		<aside style="display: flex; width: {fileBrowserWidth}px;">
			<FileBrowser />
		</aside>
		<ResizeBar resize={startResizeFileBrowser} />
		<div class="editor-group">
			<div class="editor-toolbar">
				<button
					aria-label="run"
					class="editor-toolbar-button {buttonStyle('runstop')}"
					onclick={runStop}
				>
					{#if !s.running}
						<span class="icon fa-solid fa-play"></span> Run
					{:else}
						<span class="icon fa-solid fa-stop"></span> Stop
					{/if}
				</button>
				<button
					aria-label="save"
					class="editor-toolbar-button editor-button-save"
					onclick={openSaveDialog}
				>
					<span class="icon fa-solid fa-floppy-disk"></span> Save
				</button>
			</div>
			<div class="middle">
				<div class="editor">
					<Editor />
				</div>
				<ResizeBar resize={startResizeTerm} />
				<aside class="terminal" style="width: {terminalWidth}px;">
					<Terminal />
				</aside>
			</div>
		</div>
	</div>
	<div class="bottom">
		<p>Beancode Web version {BEANCODE_WEB_VERSION}</p>
		{#if ps.ready}
			<p>loaded <strong>{s.versionText}</strong></p>
		{:else}
			<p>loading</p>
		{/if}
	</div>
	<SaveDialog bind:this={saveDialog} cancel={() => saveDialog.close()} ok={saveOk} />
	<MessageDialog bind:this={messageDialog} />
</div>

<style>
	.icon {
		margin-right: 0.4em;
	}

	.editor-window {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}

	.outer-wrapper {
		display: flex;
		height: 100%;
		min-height: 0;
		flex-direction: row;
	}

	.editor-group {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		min-width: 0;
	}

	.middle {
		display: flex;
		flex: 1;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: space-between;
		align-items: stretch;
		min-height: 0;
	}

	.bottom {
		flex: 0 0 auto;
		display: flex;
		min-height: 0;
		justify-content: space-between;
	}

	.bottom p {
		color: var(--bw-subtext1);
		font-family: 'IBM Plex Mono', 'monospace';
		font-size: 0.8em;
		margin-top: 0.5em;
		margin: 0.2em;
	}

	.editor {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}

	.editor-toolbar {
		display: flex;
		margin-bottom: 0.2em;
	}

	.editor-toolbar-button {
		display: inline-flex;
		height: 2em;
		justify-content: center;
		align-items: center;
		font-family: 'Inter', sans-serif;
		font-size: 1em;
		background-color: var(--bw-surface1);
		color: var(--bw-text);
		border: 0px solid black;
		padding: 0.3em;
		padding-left: 0.5em;
		padding-right: 0.5em;
		margin: 0.2em;
		border-radius: 0.5em;
		transition:
			background-color 130ms ease,
			color 130ms ease,
			font-weight 130ms ease;
	}

	.editor-button-run {
		background-color: var(--bw-green);
		color: var(--bw-base1);
	}

	.editor-button-run:hover {
		background-color: var(--bw-base2);
		color: var(--bw-green);
		font-weight: bold;
	}

	.editor-button-stop {
		background-color: var(--bw-red);
		color: var(--bw-base1);
	}

	.editor-button-stop:hover {
		background-color: var(--bw-base2);
		color: var(--bw-red);
		font-weight: bold;
	}

	.editor-button-grayed {
		background-color: var(--bw-surface1);
		color: var(--bw-subtext1);
	}

	.editor-button-grayed:hover {
		cursor: not-allowed;
	}

	.editor-button-save {
		background: var(--bw-cyan);
		color: var(--bw-base1);
	}

	.editor-button-save:hover {
		background: var(--bw-base1);
		color: var(--bw-cyan);
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
