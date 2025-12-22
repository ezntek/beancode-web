<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { post } from '$lib/workers/pyodide_state.svelte';
	import { pathJoin } from '$lib/fstypes';
	import { es } from './editor_state.svelte';
	import { s } from './state.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import SaveDialog from '$lib/components/SaveDialog.svelte';

	let confirmDialog: ConfirmDialog;
	let saveDialog: SaveDialog;
	let lastClicked: string = '';

	function confirmOk() {
		save();
	}

	function confirmCancel() {
		// just for good measure
		es.saved = false;
	}

	function saveOk(fileName: string, fileType: string) {
		let name = fileName;
		name += fileType !== '' ? '.' + fileType : '';
		es.curFilePath = pathJoin(s.cwd, name);
		es.curFileName = name;
		save();
	}

	function saveCancel() {
		// just for good measure
		es.saved = false;
	}

	function save() {
		post({ kind: 'newfile', path: es.curFilePath, contents: es.editorSrc, overwrite: true });
		es.saved = true;
		read(lastClicked);
	}

	function read(name: string) {
		if (!es.saved) return;

		es.curFilePath = pathJoin(s.cwd, name);
		es.curFileName = name;
		post({ kind: 'readfile', path: es.curFilePath });
	}

	onMount(() => {});

	function clickItem(name: string) {
		lastClicked = name;
		if (s.curdir.get(name)) {
			s.cwd = pathJoin(s.cwd, name);
			post({ kind: 'listdir', path: s.cwd });
		} else {
			if (!es.saved) {
				confirmDialog.open('File has not been saved. Should we save it for you?');
			}
			read(name);
		}
	}

	let cwd = $derived(pathJoin(s.cwd, '.'));
</script>

<div class="file-browser">
	{#each s.curdir.keys() as item}
		{#if item !== '.'}
			{#if item === '..'}
				<button
					aria-label="goback"
					class="file-browser-item"
					style="background-color: var(--bw-surface1);"
					onclick={() => clickItem(item)}
				>
					{#if s.cwd !== '/'}
						<span class="fa-solid fa-arrow-left"></span>
					{/if}
					{cwd}
				</button>
			{:else if s.curdir.get(item)}
				<button class="file-browser-item" onclick={() => clickItem(item)}>
					<span class="fa-regular fa-folder"></span>
					{item}
				</button>
			{:else}
				<button class="file-browser-item" onclick={() => clickItem(item)}>
					<span class="fa-regular fa-file"></span>
					{item}
				</button>
			{/if}
		{/if}
	{/each}
</div>
<ConfirmDialog
	bind:this={confirmDialog}
	ok={confirmOk}
	cancel={confirmCancel}
	okText="Yes"
	cancelText="No"
/>
<SaveDialog bind:this={saveDialog} ok={saveOk} cancel={saveCancel} />

<style>
	.file-browser {
		display: flex;
		flex: 1 0 auto;
		flex-direction: column;
		background-color: var(--bw-base2);
		margin-left: 0.2em;
		height: 100%;
		width: 100%;
		width: 18.5%;
	}
	.file-browser-item {
		border-width: 0px;
		margin-left: 0.5em;
		margin-right: 0.5em;
		margin-top: 0.5em;
		border-radius: 0.15em;
		padding: 0.3em;
		padding-left: 0.5em;
		text-align: left;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 1em;
		background-color: var(--bw-base3);
		color: var(--bw-text);
		overflow: hidden;
	}
	.file-browser-item:hover {
		background-color: var(--bw-surface1);
	}
</style>
