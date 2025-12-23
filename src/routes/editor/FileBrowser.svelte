<script lang="ts">
	import { onMount } from 'svelte';
	import { post } from '$lib/workers/pyodide_state.svelte';
	import {
		pathBasename,
		pathBeginsWith,
		pathCountParts,
		pathExtension,
		pathJoin
	} from '$lib/fstypes';
	import { es } from './editor_state.svelte';
	import { s } from './state.svelte';
	import SaveDialog from '$lib/components/SaveDialog.svelte';
	import FileBrowserItem from '$lib/components/FileBrowserItem.svelte';
	import MessageDialog from '$lib/components/MessageDialog.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

	let saveDialog: SaveDialog;
	let confirmDialog: MessageDialog;
	let lastClicked: string = '';

	function saveOk(fileName: string) {
		es.curFilePath = pathJoin(s.cwd, fileName);
		save();
	}

	function saveCancel() {
		// just for good measure
		es.saved = false;
		read(lastClicked);
	}

	function save() {
		post({ kind: 'newfile', path: es.curFilePath, contents: es.src, overwrite: true });
		es.saved = true;
		read(lastClicked);
	}

	function read(name: string) {
		post({ kind: 'readfile', path: pathJoin(s.cwd, name) });
	}

	onMount(() => {});

	function determineIcon(name: string): string {
		if (s.curdir.get(name)) return 'fa-regular fa-folder';

		const ext = pathExtension(name);
		switch (ext) {
			case 'bean':
			case 'pseudocode':
			case 'pseudo':
			case 'psc':
				return 'fa-regular fa-file-code';
			case 'py':
				return 'fa-brands fa-python';
			case 'txt':
				return 'fa-regular fa-file-lines';
			default:
				return 'fa-regular fa-file';
		}
	}

	function clickItem(name: string) {
		lastClicked = name;
		if (s.curdir.get(name)) {
			s.cwd = pathJoin(s.cwd, name);
			post({ kind: 'listdir', path: s.cwd });
		} else {
			if (!es.saved) {
				if (es.curFilePath === '') saveDialog.open();
				else save();
				return;
			}
			read(name);
		}
	}

	function deleteItem(name: string) {
		lastClicked = name;
		confirmDialog.open(`Are you sure you want to delete ${name}?`);
	}

	function deleteItemForReal() {
		const path = pathJoin(s.cwd, lastClicked);
		post({ kind: 'delfile', path: path });
	}

	let cwd = $derived(pathJoin(s.cwd));
	let inProjects = $derived(pathBeginsWith(s.cwd, '/data/projects') && pathCountParts(s.cwd) === 3);
</script>

<div class="file-browser">
	<FileBrowserItem cwdDisplay onClick={() => clickItem('..')}>
		{#if !inProjects}
			<span class="fa-solid fa-arrow-left"></span>
		{:else}
			<strong class="project-label">Current Project</strong>
			<br />
		{/if}
		{#if inProjects}
			{pathBasename(cwd)}
		{:else}
			{cwd}
		{/if}
	</FileBrowserItem>
	{#if s.curdir.size >= 3}
		{#each s.curdir.keys() as item}
			{#if item !== '.' && item !== '..'}
				<FileBrowserItem onClick={() => clickItem(item)} onDelete={() => deleteItem(item)}>
					<span class={determineIcon(item)}></span>
					{item}
				</FileBrowserItem>
			{/if}
		{/each}
	{:else}
		<center class="empty">empty...</center>
	{/if}
</div>
<SaveDialog bind:this={saveDialog} ok={saveOk} cancel={saveCancel} />
<ConfirmDialog
	bind:this={confirmDialog}
	ok={deleteItemForReal}
	cancel={() => {
		confirmDialog.close();
	}}
	okText="Yes"
	cancelText="No"
/>

<style>
	.empty {
		font-family: 'IBM Plex Mono', monospace;
		color: var(--bw-subtext1);
		margin-top: 0.6em;
	}

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
</style>
