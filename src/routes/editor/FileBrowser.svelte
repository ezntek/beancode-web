<script lang="ts">
	import { onMount } from 'svelte';
	import { s } from './state.svelte';
	import { post } from '$lib/workers/pyodide_state.svelte';
	import { pathJoin } from '$lib/fstypes';

	onMount(() => {});

	function clickFile(name: string) {
		// is dir
		if (s.curdir.get(name)) {
			s.cwd = pathJoin(s.cwd, name);
			post({ kind: 'listdir', path: s.cwd });
		} else {
			post({ kind: 'readfile', path: pathJoin(s.cwd, name) });
		}
	}
</script>

<div class="file-browser">
	{#each s.curdir.keys() as item}
		{#if item !== '.'}
			<button class="file-browser-item" onclick={() => clickFile(item)}>
				{#if item === '..'}
					<span class="fa-solid fa-arrow-left"></span>
				{:else if s.curdir.get(item)}
					<span class="fa-regular fa-folder"></span>
					{item}
				{:else}
					<span class="fa-regular fa-file"></span>
					{item}
				{/if}
			</button>
		{/if}
	{/each}
</div>

<style>
	.file-browser {
		display: flex;
		flex: 1 0 auto;
		flex-direction: column;
		background-color: var(--bw-base3);
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
		padding: 0.2em;
		padding-left: 0.4em;
		text-align: left;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 1em;
		background-color: var(--bw-surface1);
		color: var(--bw-text);
		overflow: hidden;
	}
</style>
