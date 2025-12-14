<script lang="ts">
	import { Xterm, XtermAddon } from '@battlefieldduck/xterm-svelte';
	import {
		type ITerminalOptions,
		type ITerminalInitOnlyOptions
	} from '@battlefieldduck/xterm-svelte';
	import { termState as ts } from './terminal_state.svelte';

	const options: ITerminalOptions & ITerminalInitOnlyOptions = {
		fontFamily: 'monospace',
		cursorBlink: true
	};

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
		if (!ts.canInput) return;

		switch (data) {
			case '\r':
				write('\r\n');
				break;
			case '\x7f':
				write('\b \b');
				break;
			case '\u001b[3~':
				write(' \b');
				break;
			case '\u0004':
				write('\x1b[2J\x1b[H');
				break;
			case '\u001b[A':
			case '\u001b[B':
				return;
			default:
				write(data);
				break;
		}
	}

	function onKey(data: { key: string; domEvent: KeyboardEvent }) {
		console.log(data);
	}
</script>

<Xterm bind:terminal={ts.terminal!} {options} {onLoad} {onData} {onKey} />
