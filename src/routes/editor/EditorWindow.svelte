<!--
 Beancode Web

 Copyright (c) 2026-present Eason Qin <eason@ezntek.com>

 This Source Code Form is subject to the terms of the Mozilla Public
 license, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->

<script lang="ts">
	import { onMount, tick } from 'svelte';

	import Editor from './Editor.svelte';

	import { BEANCODE_WEB_VERSION } from '$lib/version';

	import { setupWorker } from './handle_worker.svelte';
	import Terminal from './Terminal.svelte';
	import { post, ps } from '$lib/workers/pyodide_state.svelte';
	import {
		s,
		setFileResponseCallback,
		setDoneTracingCallback,
		setDoneFormattingCallback,
		setDownloadCallback,
		setDownloadCwdCallback,
		saveFile,
		INPUT_MAX
	} from './state.svelte';
	import { termState as ts } from './terminal_state.svelte';
	import FileBrowser from './FileBrowser.svelte';
	import ResizeBar from '$lib/components/ResizeBar.svelte';
	import SaveDialog from '$lib/components/SaveDialog.svelte';
	import MessageDialog from '$lib/components/MessageDialog.svelte';
	import {
		displayFileResponse,
		pathBasename,
		pathJoin,
		FileResponseKind,
		type FileResponse
	} from '$lib/fstypes';
	import { changeFile, curExtension, editorNewFile, es } from './editor_state.svelte';
	import AboutDialog from '$lib/components/AboutDialog.svelte';
	import ErrorDialog from '$lib/components/ErrorDialog.svelte';
	import TraceDialog from '$lib/components/TraceDialog.svelte';
	import type { TracerConfig } from '$lib/tracer';

	let ibuf: Uint8Array;
	let terminalWidth = $state(0);
	let fileBrowserWidth = $state(0);
	let newAfterSave = $state(false);
	let downloadFile = $state(false);
	let terminalShown = $state(true);
	let fileBrowserShown = $state(true);
	let tracerOutput = '';
	let aboutDialog: AboutDialog;
	let saveDialog: SaveDialog;
	let traceDoneDialog: SaveDialog;
	let errorDialog: ErrorDialog;
	let messageDialog: MessageDialog;
	let traceDialog: TraceDialog;

	function isTracerOutput(src: string): boolean {
		return src.startsWith('<!DOCTYPE html>\n<!-- Generated HTML by beancode');
	}

	function handleTracerOutput(src: string) {
		const blob = new Blob([src], { type: 'text/html' });
		const url = URL.createObjectURL(blob);
		window.open(url, '_blank', 'noopener');
	}

	function setTermWidth() {
		const twidth = localStorage.getItem('EditorTerminalWidth');
		if (twidth) {
			terminalWidth = Number.parseInt(twidth);
		} else {
			terminalWidth = window.innerWidth * 0.3;
		}
	}

	function setFileBrowserWidth() {
		const fbwidth = localStorage.getItem('EditorFileBrowserWidth');
		if (fbwidth) {
			fileBrowserWidth = Number.parseInt(fbwidth);
		} else {
			fileBrowserWidth = window.innerWidth * 0.1;
		}
	}

	onMount(async () => {
		s.inputBuf = new SharedArrayBuffer(INPUT_MAX + 4);
		s.interruptBuf = new SharedArrayBuffer(1);
		ibuf = new Uint8Array(s.interruptBuf);
		await setupWorker();

		setTermWidth();
		setFileBrowserWidth();

		setDoneFormattingCallback(doneFormattingCallback);
		setDoneTracingCallback(doneTracingCallback);
		setFileResponseCallback(fileResponseCallback);
		setDownloadCallback(downloadCallback);
		// @ts-ignore
		setDownloadCwdCallback(downloadCwdCallback);
	});

	function doneFormattingCallback(data: string, path: string) {
		if (data && es.curFilePath === path) {
			es.src = data;
			saveFile(true, path);
		}
	}

	function doneTracingCallback(data: string) {
		tracerOutput = data;
		traceDoneDialog.open(undefined, 'tracer_output.html');
	}

	function fileResponseCallback(msgKind: string, path: string, response?: FileResponse<any>) {
		if (!response) {
			if (msgKind === 'delfile-response') {
				if (path === es.curFilePath) editorNewFile();
			}
			return;
		}

		if (response.kind != FileResponseKind.Ok) {
			errorDialog.open(
				[
					'An error occurred while interacting with the file system:',
					displayFileResponse(response)
				],
				() => {
					if (msgKind === 'newfile-response') {
						if (tracerOutput !== '') {
							traceDoneDialog.open(undefined, pathBasename(path), true);
							return;
						} else {
							saveDialog.open(undefined, pathBasename(path), true);
							return;
						}
					}
				}
			);
			return;
		}

		switch (msgKind) {
			case 'readfile-response':
				const dat: string = response.data;
				if (downloadFile) {
					downloadFile = false;
					downloadCallback(pathBasename(path), dat);
					return;
				}
				if (isTracerOutput(response.data)) {
					handleTracerOutput(dat);
					return;
				}
				changeFile(dat, path);
				break;
			case 'newfile-response':
				if (tracerOutput !== '') {
					tracerOutput = '';
					return;
				}

				tick().then(() => {
					es.curFilePath = path;
					es.saved = true;
				});
				if (newAfterSave) {
					editorNewFile();
					setTimeout(() => {
						es.saved = true;
						// XXX: hacky AF but ig it works?!?!?
					}, 50);
				}
				break;
			case 'renamefile-response':
				const newPath: string = response.data;
				if (es.curFilePath == path) {
					changeFile(es.src, newPath);
					saveFile(true);
				}
				break;
			case 'compressdir-response':
				downloadCwdCallback(response.data);
				break;
			default:
				break;
		}
	}

	function downloadCallback(name: string, data?: string) {
		if (data) {
			const blob = new Blob([data], { type: 'text/plain' });
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = name;
			a.click();
			URL.revokeObjectURL(a.href);
		} else {
			const path = pathJoin(s.cwd, name);
			downloadFile = true;
			post({ kind: 'readfile', path: path });
		}
	}

	function downloadCwdCallback(blob: Blob) {
		if (!blob) {
			post({ kind: 'compressdir', path: s.cwd });
			return;
		}

		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = pathBasename(s.cwd);
		a.click();
		URL.revokeObjectURL(a.href);
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
			ts.termFitAddon!.fit();
		}

		e.target.addEventListener('pointermove', onMove);
		e.target.addEventListener('pointerup', onUp);
	}

	function startResizeFileBrowser(e: any) {
		const container = e.currentTarget.parentElement;
		const rect = container.getBoundingClientRect();
		const min = rect.width * 0.05;
		const max = rect.width * 0.35;

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

	// actually useful UI bound functions
	function stop() {
		// SIGINT
		ibuf[0] = 2;
		const flag = new Int32Array(s.inputBuf!, 0, 1);
		Atomics.store(flag, 0, 0);
		Atomics.notify(flag, 0);
		s.running = false;
		ts.canInput = false;
		ts.terminal!.writeln('');
	}

	function runStopTooltip() {
		if (s.running) {
			return 'Stop execution';
		}

		switch (curExtension()) {
			case 'bean':
				return 'Run your code';
			case 'py':
				return 'Run your Python code';
			default:
				return 'You cannot run this file type.';
		}
	}

	function runStop() {
		if (!ps.ready) return;

		ps.curError = null;

		if (s.running) {
			stop();
			return;
		}

		if (curExtension() !== 'py' && curExtension() !== 'bean') return;

		if (es.curFilePath !== '') {
			saveFile(true);
		}
		s.running = true;
		if (curExtension() === 'py') {
			post({ kind: 'runpy', data: es.src, path: es.curFilePath });
		} else {
			post({ kind: 'run', data: es.src, path: es.curFilePath });
		}
	}

	function buttonStyle(name: string): string {
		if (!ps.ready) return 'editor-button-grayed';
		switch (name) {
			case 'runstop':
				if (s.running) {
					return 'editor-button-stop';
				} else {
					switch (curExtension()) {
						case 'py':
							return 'editor-button-runpy';
						case 'bean':
							return 'editor-button-run';
						default:
							return 'editor-button-grayed';
					}
				}
			case 'save':
				return 'editor-button-save';
			case 'new':
				return 'editor-button-new';
			case 'format':
				if (curExtension() === 'bean') return 'editor-button-format';
				else return 'editor-button-grayed';
			case 'trace':
				if (curExtension() === 'bean') return 'editor-button-trace';
				else return 'editor-button-grayed';
			default:
				return '';
		}
	}

	function openSaveDialog() {
		if (!ps.ready) return;

		if (es.curFilePath === '') {
			saveDialog.open();
		} else {
			saveFile(true);
		}
	}

	function saveOk(fileName: string, overwrite: boolean) {
		saveFile(overwrite, pathJoin(s.cwd, fileName));
	}

	function formatTooltip() {
		if (curExtension() !== 'bean')
			return 'You can only format Beancode (Pseudocode) files right now.';
		return 'Format (prettify) your current source code file.';
	}

	function formatFile() {
		if (curExtension() !== 'bean') return;
		ps.curError = null;
		post({ kind: 'format', data: es.src, path: es.curFilePath ?? '(beanweb)' });
	}

	function traceFile() {
		if (curExtension() !== 'bean') return;
		ps.curError = null;
		traceDialog.open(es.src);
	}

	function traceOk(vars: string[], config: TracerConfig) {
		saveFile(true); // we can only call this function if the file is a saved beancode file anyway
		post({ kind: 'trace', path: es.curFilePath, data: es.src, vars: vars, config: config });
	}

	function traceDoneOk(fileName: string, overwrite: boolean) {
		post({
			kind: 'newfile',
			path: pathJoin(s.cwd, fileName),
			contents: tracerOutput,
			overwrite
		});
	}
</script>

<div class="editor-window">
	<div class="outer-wrapper">
		{#if fileBrowserShown}
			<aside style="display: flex; width: {fileBrowserWidth}px; max-width: {fileBrowserWidth}px;">
				<FileBrowser />
			</aside>
			<ResizeBar resize={startResizeFileBrowser} />
		{/if}
		<div class="editor-group">
			<div class="toolbar">
				<button
					aria-label="run"
					class="toolbar-button {buttonStyle('runstop')}"
					title={runStopTooltip()}
					onclick={runStop}
				>
					{#if !s.running}
						<span
							class="icon {curExtension() === 'py' ? 'fa-brands fa-python' : 'fa-solid fa-play'}"
						></span> Run
					{:else}
						<span class="icon fa-solid fa-stop"></span> Stop
					{/if}
				</button>
				<button
					aria-label="save"
					class="toolbar-button {buttonStyle('save')}"
					onclick={openSaveDialog}
					title="Save the current file"
				>
					<span class="icon fa-solid fa-floppy-disk"></span> Save
				</button>
				<button
					aria-label="format"
					class="toolbar-button {buttonStyle('format')}"
					title={formatTooltip()}
					onclick={formatFile}
				>
					<span class="icon fa-solid fa-wand-magic-sparkles"></span> Format
				</button>
				<button
					aria-label="trace"
					class="toolbar-button {buttonStyle('trace')}"
					title="Generate a trace table for the current file"
					onclick={traceFile}
				>
					<span class="icon fa-solid fa-magnifying-glass"></span> Trace
				</button>
				<div style="margin-right: auto"></div>
				<button
					aria-label="toggle file browser"
					class="toolbar-aux-button {fileBrowserShown ? 'toolbar-aux-button-enabled' : ''}"
					onclick={() => (fileBrowserShown = !fileBrowserShown)}
				>
					<span class="fa-solid fa-folder-tree"></span>
				</button>
				<button
					aria-label="toggle terminal"
					class="toolbar-aux-button {terminalShown ? 'toolbar-aux-button-enabled' : ''}"
					onclick={() => (terminalShown = !terminalShown)}
				>
					<span class="fa-solid fa-terminal"></span>
				</button>
				<button
					aria-label="Go to project GitHub"
					class="toolbar-aux-button"
					onclick={() =>
						window.open('https://github.com/ezntek/beancode-web', '_blank', 'noopener,noreferrer')}
				>
					<span class="fa-brands fa-github"></span>
				</button>
				<button aria-label="info" class="toolbar-aux-button" onclick={() => aboutDialog.open()}>
					<span class="fa-solid fa-circle-info"></span>
				</button>
			</div>
			<div class="middle">
				<div class="editor">
					<Editor />
				</div>
				{#if terminalShown}
					<ResizeBar resize={startResizeTerm} />
					<aside class="terminal" style="width: {terminalWidth}px;">
						<Terminal />
					</aside>
				{/if}
			</div>
		</div>
	</div>
	<div class="bottom">
		<p>Beancode Web version {BEANCODE_WEB_VERSION}</p>
		{#if ps.ready}
			<p>loaded beancode <strong>v{s.versionText}</strong></p>
		{:else}
			<p>loading beancode</p>
		{/if}
	</div>
</div>
<AboutDialog bind:this={aboutDialog} />
<SaveDialog
	bind:this={saveDialog}
	cancel={() => saveDialog.close()}
	ok={saveOk}
	title="Save Current File"
/>
<SaveDialog
	bind:this={traceDoneDialog}
	ok={traceDoneOk}
	cancel={() => saveDialog.close()}
	title="Save tracer output"
/>
<MessageDialog bind:this={messageDialog} />
<ErrorDialog bind:this={errorDialog} />
<TraceDialog bind:this={traceDialog} ok={traceOk} cancel={() => traceDialog.close()} />

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

	.toolbar {
		display: flex;
		margin-bottom: 0.4em;
	}

	.toolbar-aux-button {
		font-size: 1em;
		border-radius: 0.25em;
		border: 1px solid var(--bw-surface2);
		background-color: var(--bw-base2);
		color: var(--bw-subtext1);
		aspect-ratio: 1 / 1;
		margin: 0.2em;
		transition:
			background-color 130ms ease,
			color 130ms ease,
			font-weight 130ms ease;
		transition-delay: 0ms;
	}

	.toolbar-aux-button:hover {
		border: 1px solid var(--bw-surface3);
		background-color: var(--bw-surface1);
		color: var(--bw-text);
	}

	.toolbar-aux-button-enabled {
		border: 1px solid var(--bw-surface3);
		background-color: var(--bw-surface1);
		color: var(--bw-text);
	}

	.toolbar-button {
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
		transition-delay: 0ms;
	}

	.toolbar-button:hover {
		transition-delay: 15ms;
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

	.editor-button-runpy {
		background-color: var(--bw-blue);
		color: var(--bw-base1);
	}

	.editor-button-runpy:hover {
		background-color: var(--bw-base2);
		color: var(--bw-blue);
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
		font-weight: bold;
	}

	.editor-button-new {
		background: var(--bw-magenta);
		color: var(--bw-base1);
	}

	.editor-button-new:hover {
		background: var(--bw-base1);
		color: var(--bw-magenta);
		font-weight: bold;
	}

	.editor-button-format {
		background: var(--bw-yellow);
		color: var(--bw-base1);
	}

	.editor-button-format:hover {
		background: var(--bw-base1);
		color: var(--bw-yellow);
		font-weight: bold;
	}

	.editor-button-trace {
		background: var(--bw-orange);
		color: var(--bw-base1);
	}

	.editor-button-trace:hover {
		color: var(--bw-orange);
		background: var(--bw-base1);
		font-weight: bold;
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
