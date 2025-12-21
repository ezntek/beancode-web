<script lang="ts">
	import { onMount } from 'svelte';
	import { s } from './state.svelte';
	import { post } from '$lib/workers/pyodide_state.svelte';
	import { pathJoin } from '$lib/fstypes';

	onMount(() => {});

	function clickFile(name: string) {
		if (s.curdir.get(name)) {
			s.cwd = pathJoin(s.cwd, name);
			post({ kind: 'listdir', path: s.cwd });
		} else {
			s.curFileName = pathJoin(s.cwd, name);
			post({ kind: 'readfile', path: s.curFileName });
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
					onclick={() => clickFile(item)}
				>
					{#if s.cwd !== '/'}
						<span class="fa-solid fa-arrow-left"></span>
					{/if}
					{cwd}
				</button>
			{:else if s.curdir.get(item)}
				<button class="file-browser-item" onclick={() => clickFile(item)}>
					<span class="fa-regular fa-folder"></span>
					{item}
				</button>
			{:else}
				<button class="file-browser-item" onclick={() => clickFile(item)}>
					<span class="fa-regular fa-file"></span>
					{item}
				</button>
			{/if}
		{/if}
	{/each}
</div>

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
