<script lang="ts">
	import { Xterm } from '@battlefieldduck/xterm-svelte';
	import type {
		ITerminalOptions,
		ITerminalInitOnlyOptions,
		Terminal
	} from '@battlefieldduck/xterm-svelte';
	import { onMount } from 'svelte';
	let pyodideReady = $state(false);
	let worker: Worker;
	const loadWorker = async () => {
		const W = await import('$lib/workers/worker.ts?worker');
		worker = new W.default();
		console.log('imported worker ' + worker);
		interface WorkerMessage {
			type: 'ready' | 'output' | 'clear' | 'log';
			data: string;
		}
		worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
			switch (event.data.type) {
				case 'ready':
					pyodideReady = true;
					break;
				case 'clear':
					terminal?.clear();
					break;
				case 'output':
					terminal?.writeln(event.data.data);
					break;
				case 'log':
					log = event.data.data;
					break;
			}
		};
	};
	onMount(async () => {
		await loadWorker();
	});

	let src = $state(`for i in range(5):
    print(str(i+1) + " absolute BAJODING")
import time
time.sleep(2)
print("we are done")
`);
	let log = $state('Waiting for worker to launch');

	let terminal = $state<Terminal>();
	const options: ITerminalOptions & ITerminalInitOnlyOptions = {
		fontFamily: 'monospace',
		cursorBlink: true
	};

	async function onLoad() {
		console.log('child component has loaded');

		/*const fitAddon = new (await XtermAddon.FitAddon()).FitAddon();
		terminal?.loadAddon(fitAddon);
		fitAddon.fit();*/
		terminal?.writeln('\x1b[1mReady.\x1b[0m');
	}

	function onData(data: string) {
		data;
		//if (data == '\r') terminal?.writeln('');
		//terminal?.write(data);
	}

	function onKey(data: { key: string; domEvent: KeyboardEvent }) {
		data;
		//console.log('key: ', data);
	}

	function run() {
		worker.postMessage({ src: src });
	}
</script>

<div class="outer">
	{#if pyodideReady}
		<button
			onclick={() => {
				run();
			}}>do magic</button
		>
	{:else}
		<p>loading pyodide</p>
	{/if}
	<div class="main">
		<textarea bind:value={src}></textarea>
		<Xterm bind:terminal {options} {onLoad} {onData} {onKey} />
	</div>
	<p>{log}</p>
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
