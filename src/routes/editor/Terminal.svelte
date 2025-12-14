<script lang="ts">
	import { Xterm, XtermAddon } from '@battlefieldduck/xterm-svelte';
	import {
		type ITerminalOptions,
		type ITerminalInitOnlyOptions
	} from '@battlefieldduck/xterm-svelte';
	import { termState as ts } from './terminal_state.svelte';
	import { inputBuf, interruptBuf } from './state.svelte';

	const options: ITerminalOptions & ITerminalInitOnlyOptions = {
		fontFamily: 'monospace',
		cursorBlink: true
	};

	let termInputBuf = '';
	const encoder = new TextEncoder();

	const write = (s: string) => ts.terminal?.write(s);
	const writeln = (s: string) => ts.terminal?.writeln(s);

	async function onLoad() {
		console.log('child component has loaded');

		const fitAddon = new (await XtermAddon.FitAddon()).FitAddon();
		ts.terminal?.loadAddon(fitAddon);
		fitAddon.fit();
		writeln('Terminal loaded successfully');
	}

	function onData(data: string) {
		data;
	}

	function onKey(data: { key: string; domEvent: KeyboardEvent }) {
		if (!ts.canInput) return;
		const ch = data.key;
		switch (ch) {
			case '\r':
				write('\r\n');
				const flag = new Int32Array(inputBuf, 0, 1);
				Atomics.store(flag, 0, termInputBuf.length);
				const sabdata = new Uint8Array(inputBuf, 4);
				// store string as well
				const encoded = encoder.encode(termInputBuf);
				sabdata.set(encoded);
				termInputBuf = '';
				Atomics.notify(flag, 0);
				ts.canInput = false;
				break;
			case '\x7f':
				termInputBuf = termInputBuf.substring(0, -1);
				write('\b \b');
				break;
			case '\u0004':
			case '\u001b[3~':
			case '\u001b[A':
			case '\u001b[B':
			case '\u001b[C':
			case '\u001b[D':
				return;
			default:
				termInputBuf += ch;
				write(ch);
				break;
		}
	}
</script>

<Xterm bind:terminal={ts.terminal!} {options} {onLoad} {onData} {onKey} />
