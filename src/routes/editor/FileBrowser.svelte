<script lang="ts">
	import { onMount } from 'svelte';
	import { post, ps } from '$lib/workers/pyodide_state.svelte';
	import {
		pathBasename,
		pathBeginsWith,
		pathCountParts,
		pathExtension,
		pathJoin
	} from '$lib/fstypes';
	import { editorNewFile, es } from './editor_state.svelte';
	import { downloadCallback, downloadCwdCallback, s, saveFile } from './state.svelte';
	import SaveDialog from '$lib/components/SaveDialog.svelte';
	import FileBrowserItem from '$lib/components/FileBrowserItem.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import ErrorDialog from '$lib/components/ErrorDialog.svelte';

	let saveDialog: SaveDialog;
	let renameDialog: SaveDialog;
	let confirmDialog: ConfirmDialog;
	let uploadElem: HTMLInputElement;
	let errorDialog: ErrorDialog;
	let lastClicked = '';
	let cwd = $derived(pathJoin(s.cwd));
	let inProjects = $derived(pathBeginsWith(s.cwd, '/data/projects') && pathCountParts(s.cwd) === 3);
	let atProjects = $derived(pathBeginsWith(s.cwd, '/data/projects') && pathCountParts(s.cwd) === 2);
	let dropdownPosition = $state({ x: 0, y: 0 });

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

	function quitProject(name: string) {
		name;
		if (!es.curFilePath) return;

		saveFile(true);
		es.curFilePath = '';
		editorNewFile();
	}

	function openItem(name: string) {
		lastClicked = name;
		if (s.curdir.get(name)) {
			s.cwd = pathJoin(s.cwd, name);
			post({ kind: 'listdir', path: s.cwd });
		} else {
			if (!es.saved) {
				if (es.curFilePath === '')
					saveDialog.open('Save', undefined, undefined, (fileName: string, overwrite: boolean) => {
						overwrite;
						es.curFilePath = pathJoin(s.cwd, fileName);
						save();
					});
				else save();
				return;
			}
			read(name);
		}
	}

	function clickItem(name: string) {
		if (s.running) return;

		if (name === '..') {
			if (atProjects) return;
			if (!inProjects) return;

			confirmDialog.open(
				[
					'Are you sure you want to exit this project?',
					'This will save and close the current file.'
				],
				() => {
					quitProject(name);
					openItem(name);
				}
			);
			return;
		} else {
			openItem(name);
		}
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

	function handleDelete(name: string) {
		if (name === '..') {
			return;
		}

		// is a dir
		if (s.curdir.get(name)) return;

		lastClicked = name;
		confirmDialog.open(
			[`Are you sure you want to delete ${name}?`],
			// Ok
			() => {
				deleteItemForReal();
			},
			// Cancel
			() => {}
		);
	}

	function deleteItemForReal() {
		const path = pathJoin(s.cwd, lastClicked);
		post({ kind: 'delfile', path: path });
	}

	function handleRename(name: string) {
		if (name === '..') {
			return;
		}

		lastClicked = name;
		renameDialog.open('Rename', name);
	}

	function handleDownload(name: string) {
		if (name == '..') downloadCwdCallback!();
		else downloadCallback!(name);
	}

	function renameOk(name: string, overwrite: boolean) {
		if (s.curdir.has(name) && !overwrite) {
			errorDialog.open([`File ${name} already exists!`], () => {
				renameDialog.open('Rename', name, true);
			});
			return;
		}

		post({
			kind: 'renamefile',
			oldpath: pathJoin(s.cwd, lastClicked),
			newpath: pathJoin(s.cwd, name)
		});
	}

	function newFileOk(fileName: string, overwrite: boolean) {
		if (s.curdir.has(fileName) && !overwrite) {
			errorDialog.open([`File ${fileName} already exists!`], () => {
				saveDialog.open('New File', fileName, true, newFileOk);
			});
			return;
		}
		editorNewFile();
		// overwrite must be true as we already did the checks
		post({ kind: 'newfile', path: pathJoin(s.cwd, fileName), contents: '', overwrite: true });
	}

	function newFile() {
		saveDialog.open('New File', undefined, false, newFileOk);
	}

	async function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.item(0);

		if (!file) return;

		const name = file.name;

		let fileContent = '';
		try {
			fileContent = await file.text();
		} catch (err) {
			errorDialog.open([`Error reading file ${name}:`, String(err)], () => {});
			return;
		}

		if (s.curdir.has(name)) {
			confirmDialog.open(
				[`File ${name} already exists, do you want to upload it with a different name?`],
				() => {
					const dotIdx = name.lastIndexOf('.');
					const namePart = name.slice(0, dotIdx);
					const extPart = name.slice(dotIdx + 1);
					let addedNum: number;
					let newName: string;
					for (
						addedNum = 1;
						s.curdir.has((newName = `${namePart} (${addedNum}).${extPart}`));
						addedNum++
					)
						continue;
					saveDialog.open(
						'Upload with different name',
						newName,
						true,
						(fileName: string, overwrite: boolean) => {
							overwrite;
							upload(fileName, fileContent);
						}
					);
				},
				() => {
					upload(name, fileContent);
				}
			);
		} else {
			upload(name, fileContent);
		}
	}

	function upload(name: string, content: string) {
		post({ kind: 'newfile', path: pathJoin(s.cwd, name), contents: content, overwrite: true });
	}
</script>

<div class="file-browser">
	<FileBrowserItem cwdDisplay onClick={() => clickItem('..')} onInfo={(e) => openInfo('..', e)}>
		{#if inProjects}
			<div style="display: flex; flex-direction: row; align-items: center; gap: 0.7em;">
				<span class="fa-solid fa-arrow-left"></span>
				<span>
					<strong class="project-label">Current Project</strong>
					<br />
					{pathBasename(cwd)}
				</span>
			</div>
		{:else if atProjects}
			<strong class="project-label">Projects</strong>
		{:else}
			<span class="fa-solid fa-arrow-left"></span>
			{cwd}
		{/if}
	</FileBrowserItem>
	<div class="toolbar">
		<p class="toolbar-label">FILES</p>
		<button class="toolbar-button toolbar-newfile" onclick={() => newFile()}>
			<span class="icon fa-solid fa-plus"></span> New
		</button>
		<button class="toolbar-button toolbar-upload" onclick={() => uploadElem.click()}>
			<span class="icon fa-solid fa-upload"></span> Upload
		</button>
	</div>
	<div class="file-browser-content">
		{#if !ps.ready}
			<center class="empty">still loading files...</center>
		{:else if s.curdir.size >= 3}
			{#each s.curdir.keys() as item}
				{#if item !== '.' && item !== '..'}
					<div style="position: relative;">
						<FileBrowserItem onClick={() => clickItem(item)} onInfo={(e) => openInfo(item, e)}>
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
<input
	bind:this={uploadElem}
	type="file"
	accept=".txt,.py,.html,.bean,text/*"
	onchange={handleFileSelect}
	hidden
/>
<SaveDialog bind:this={saveDialog} cancel={saveCancel} />
<SaveDialog bind:this={renameDialog} ok={renameOk} cancel={() => {}} />
<ConfirmDialog bind:this={confirmDialog} okText="Yes" cancelText="No" />
<ErrorDialog bind:this={errorDialog} />
{#if openDropdownItem}
	<Dropdown x={dropdownPosition.x} y={dropdownPosition.y} onClose={() => (openDropdownItem = '')}>
		{#if !atProjects}
			{#if openDropdownItem != '..'}
				<button onclick={() => handleRename(openDropdownItem)}>
					<span class="fa-solid fa-pen"></span>
					Rename
				</button>
			{/if}
			<button onclick={() => handleDownload(openDropdownItem)}>
				<span class="fa-solid fa-download"></span>
				Download
			</button>
			{#if openDropdownItem != '..'}
				<button onclick={() => handleDelete(openDropdownItem)} style="color: var(--bw-red);">
					<span class="fa-solid fa-trash"></span>
					Delete
				</button>
			{/if}
		{:else}
			<p class="label">No actions available.</p>
		{/if}
	</Dropdown>
{/if}

<style>
	.label {
		color: var(--bw-text);
		font-family: 'Inter', sans-serif;
		margin: 0.3em;
		padding: 0px;
	}
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
		gap: 0.4em;
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
	}

	.toolbar-button {
		display: flex;
		align-items: center;
		border: 0px solid black;
		color: var(--bw-base1);
		font-family: 'IBM Plex Mono', monospace;
		border-radius: 0.2em;
		background-color: var(--bw-surface1);
		color: var(--bw-text);
		transition:
			background-color 130ms ease,
			color 130ms ease,
			font-weight 130ms ease;
	}

	.toolbar-button:hover {
		background-color: var(--bw-surface1);
		font-weight: bold;
	}

	.toolbar-newfile:hover {
		color: var(--bw-green);
	}

	.toolbar-upload:hover {
		color: var(--bw-cyan);
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

	.icon {
		margin-right: 0.3em;
	}
</style>
