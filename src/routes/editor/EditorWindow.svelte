<script lang="ts">
	import { setupWorker } from './handle_worker.svelte';
	import { onMount } from 'svelte';
	import Terminal from './Terminal.svelte';
	import { pyState } from '$lib/workers/pyodide_state.svelte';
	import { interruptBuf, s } from './state.svelte';
	import { termState } from './terminal_state.svelte';

	let ibuf: Uint8Array;
	onMount(async () => {
		await setupWorker();
		s.log = 'Waiting to launch';
		ibuf = new Uint8Array(interruptBuf);
	});

	let src = $state(`// Welcome to beanweb!\n// Start typing some code below, or load an example.`);

	async function loadExample(ex: string) {
		const FILE_NAME = `${ex}.bean`;
		const res = await fetch(`/bcdata/examples/${FILE_NAME}`);
		if (res.status === 200) {
			src = await res.text();
			s.log = `loaded example ${FILE_NAME}`;
		} else {
			s.log = `could not load example ${FILE_NAME}`;
		}
	}

	function run() {
		ibuf[0] = 0;
		pyState.worker!.postMessage({ kind: 'run', data: src });
	}

	function clear() {
		src = '';
		termState.terminal!.write('\x1b[2J\x1b[H');
	}

	function stop() {
		// SIGINT
		ibuf[0] = 2;
	}
</script>

<div class="outer">
	{#if pyState.ready}
		<button onclick={() => run()}>do magic</button>
		<button onclick={() => loadExample('HelloWorld')}>load hello world example</button>
		<button onclick={() => loadExample('BubbleSort')}>load bubble sort example</button>
		<button onclick={() => loadExample('BSortTorture')}>load bubble sort benchmark</button>
		<button onclick={() => loadExample('QSortTorture')}>load quick sort benchmark</button>
		<button onclick={() => loadExample('PrimeTorture')}>load prime torture benchmark</button>
		<button onclick={() => stop()}>stop</button>
		<button onclick={() => clear()}>clear</button>
	{:else}
		<p>Loading Beancode</p>
	{/if}
	<div class="main">
		<textarea bind:value={src}></textarea>
		<Terminal />
	</div>
	<p>{s.log}</p>
</div>

<style>
	.main {
		display: flex;
		justify-content: space-between;
		gap: 1em;
	}

	.main textarea {
		flex: 1;
		resize: none;
		box-sizing: border-box;
	}
</style>
