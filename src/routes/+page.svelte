<script lang="ts">
	import { Xterm, XtermAddon } from '@battlefieldduck/xterm-svelte';
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
			type: 'ready' | 'output' | 'clear' | 'log' | 'error';
			data: string;
		}
		worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
			switch (event.data.type) {
				case 'ready':
					pyodideReady = true;
					terminal?.clear();
					break;
				case 'clear':
					terminal?.clear();
					break;
				case 'output':
					terminal?.writeln(String(event.data.data).replace(/\n/g, '\r\n'));
					break;
				case 'log':
					log = event.data.data;
					break;
				case 'error':
					terminal?.writeln('An error occurred whilst trying to interact with beancode:');
					terminal?.writeln(String(event.data.data).replace(/\n/g, '\r\n'));
					break;
			}
		};
	};
	onMount(async () => {
		await loadWorker();
	});

	let src = $state(
		`// Welcome to beanweb!\n// Start typing some code below, or load an example.\n`
	);
	let log = $state('Waiting for worker to launch');

	let terminal = $state<Terminal>();
	const options: ITerminalOptions & ITerminalInitOnlyOptions = {
		fontFamily: 'monospace',
		cursorBlink: true
	};

	async function onLoad() {
		console.log('child component has loaded');

		const fitAddon = new (await XtermAddon.FitAddon()).FitAddon();
		terminal?.loadAddon(fitAddon);
		fitAddon.fit();
		terminal?.writeln('Terminal loaded successfully');
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

	async function loadExample(ex: string) {
		const FILE_NAME = `${ex}.bean`;
		const res = await fetch(`/bcdata/examples/${FILE_NAME}`);
		if (res.status === 200) {
			src = await res.text();
			log = `loaded example ${FILE_NAME}`;
		} else {
			log = `could not load example ${FILE_NAME}`;
		}
	}
</script>

<div class="outer">
	{#if pyodideReady}
		<button onclick={() => run()}>do magic</button>
		<button onclick={() => loadExample('HelloWorld')}>load hello world example</button>
		<button onclick={() => loadExample('BubbleSort')}>load bubble sort example</button>
		<button onclick={() => (src = '')}>clear</button>
	{:else}
		<p>Loading Beancode</p>
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
