<script lang="ts">
	import { onMount } from 'svelte';
	import { post, pyState } from '$lib/workers/pyodide_state.svelte';
	import {
		pathBasename,
		pathBeginsWith,
		pathCountParts,
		pathExtension,
		pathJoin
	} from '$lib/fstypes';
	import { es } from './editor_state.svelte';
	import { downloadCallback, s } from './state.svelte';
	import SaveDialog from '$lib/components/SaveDialog.svelte';
	import FileBrowserItem from '$lib/components/FileBrowserItem.svelte';
	import MessageDialog from '$lib/components/MessageDialog.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';

	let saveDialog: SaveDialog;
	let renameDialog: SaveDialog;
	let confirmDialog: MessageDialog;
	let lastClicked = '';
	let cwd = $derived(pathJoin(s.cwd));
	let inProjects = $derived(pathBeginsWith(s.cwd, '/data/projects') && pathCountParts(s.cwd) === 3);
	let atProjects = $derived(pathBeginsWith(s.cwd, '/data/projects') && pathCountParts(s.cwd) === 2);
	let dropdownPosition = $state({ x: 0, y: 0 });

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
		if (name === '..' && atProjects) return;

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

	function handleDelete(name: string) {
		lastClicked = name;
		confirmDialog.open(`Are you sure you want to delete ${name}?`);
	}

	function deleteItemForReal() {
		const path = pathJoin(s.cwd, lastClicked);
		post({ kind: 'delfile', path: path });
	}

	let openDropdownItem = $state('');
	function openInfo(name: string, e: MouseEvent) {
		if (name === openDropdownItem) {
			openDropdownItem = '';
		} else {
			const target = e.currentTarget as HTMLElement;
			const rect = target.getBoundingClientRect();
			dropdownPosition = {
				x: rect.right + 5,
				y: rect.top
			};
			openDropdownItem = name;
		}
	}

	function handleRename(name: string) {
		lastClicked = name;
		renameDialog.open('Rename', name);
	}

	function handleDownload(name: string) {
		downloadCallback!(name);
		/*
		 */
	}

	function renameOk(name: string) {
		post({
			kind: 'renamefile',
			oldpath: pathJoin(s.cwd, lastClicked),
			newpath: pathJoin(s.cwd, name)
		});
	}
</script>

<div class="file-browser">
	<FileBrowserItem cwdDisplay onClick={() => clickItem('..')}>
		{#if inProjects}
			<strong class="project-label">Current Project</strong>
			<br />
			{pathBasename(cwd)}
		{:else if atProjects}
			<strong class="project-label">Projects</strong>
		{:else}
			<span class="fa-solid fa-arrow-left"></span>
			{cwd}
		{/if}
	</FileBrowserItem>
	<div class="toolbar">
		<p class="toolbar-label">FILES</p>
	</div>
	<div class="file-browser-content">
		{#if !pyState.ready}
			<center class="empty">still loading files...</center>
		{:else if s.curdir.size >= 3}
			{#each s.curdir.keys() as item}
				{#if item !== '.' && item !== '..'}
					<div style="position: relative;">
						<FileBrowserItem onClick={() => clickItem(item)} onRename={(e) => openInfo(item, e)}>
							<span class={determineIcon(item)}></span>
							{item}
						</FileBrowserItem>
					</div>
				{/if}
			{/each}
		{:else}
			<center class="empty">empty...</center>
		{/if}
	</div>
</div>
<SaveDialog bind:this={saveDialog} ok={saveOk} cancel={saveCancel} />
<SaveDialog bind:this={renameDialog} ok={renameOk} cancel={() => {}} />
<ConfirmDialog
	bind:this={confirmDialog}
	ok={deleteItemForReal}
	cancel={() => {
		confirmDialog.close();
	}}
	okText="Yes"
	cancelText="No"
/>
{#if openDropdownItem}
	<Dropdown x={dropdownPosition.x} y={dropdownPosition.y} onClose={() => (openDropdownItem = '')}>
		<button onclick={() => handleRename(openDropdownItem)}>
			<span class="fa-solid fa-pen"></span>
			Rename
		</button>
		<button onclick={() => handleDownload(openDropdownItem)}>
			<span class="fa-solid fa-download"></span>
			Download
		</button>
		<button onclick={() => handleDelete(openDropdownItem)} style="color: var(--bw-red);">
			<span class="fa-solid fa-trash"></span>
			Delete
		</button>
	</Dropdown>
{/if}

<style>
	.empty {
		font-family: 'IBM Plex Mono', monospace;
		color: var(--bw-subtext1);
		margin-top: 0.6em;
	}

	.dropdown {
		position: absolute;
		background: red;
		padding: 1em;
		z-index: 9999;
	}

	.toolbar {
		background-color: var(--bw-base2);
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-shrink: 0;
		margin-top: 0.4em;
	}

	.toolbar-label {
		color: var(--bw-subtext2);
		font-family: 'IBM Plex Mono', monospace;
		padding: 0;
		padding-bottom: 0.1em;
		padding-left: 0.3em;
		padding: 0.3em;
		margin: 0;
		margin-right: auto;
		font-size: 0.9em;
	}

	.file-browser {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.file-browser-content {
		display: flex;
		flex: 1 0 auto;
		flex-direction: column;
		background-color: var(--bw-base2);
		gap: 0.4em;
		padding: 0.3em;
	}
</style>
