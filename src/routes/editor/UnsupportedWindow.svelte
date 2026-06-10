<script lang="ts">
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import MessageDialog from '$lib/components/MessageDialog.svelte';
	import { UAParser } from 'ua-parser-js';

	let settingsDialog: SettingsDialog;

	function detectUserAgent() {
		const result = new UAParser().getResult();
		return `${result.browser.name} ${result.browser.version} on ${result.os.name}`;
	}
</script>

<div class="wrapper">
	<div class="header">
		<span class="fa-regular fa-frown icon"></span>
		<p class="title">Your browser is unsupported!</p>
	</div>
	<span>
		<button onclick={() => settingsDialog.open()}>Settings</button>
	</span>
	<p>beancode web needs the following features to function:</p>
	<ul>
		<li>WebAssembly</li>
		<li>SharedArrayBuffer</li>
		<li>Atomics</li>
	</ul>
	<p>
		Since one of these features seem to be missing, beancode web cannot function normally. Consider
		updating your browser, or use one of the following recommended browsers:
	</p>
	<ul>
		<li><a href="https://www.firefox.com/en-US/">Mozilla Firefox</a></li>
		<li><a href="https://brave.com/">Brave Browser (Chromium-based)</a></li>
	</ul>
	<p>Confirmed working browsers include:</p>
	<ul>
		<li>All Google Chrome/Microsoft Edge browsers released after March 2023,</li>
		<li>All Mozilla Firefox browsers released after March 2023,</li>
		<li>All Safari browsers (16.4+) on macOS Ventura (13) and above.</li>
	</ul>
	<p>Click <a href="https://caniuse.com/?search=SharedArrayBuffer">here</a> for more details.</p>
	<p class="ualabel">
		<strong>Your browser looks like:</strong>
		{detectUserAgent()}
	</p>
</div>
<SettingsDialog bind:this={settingsDialog} aboutOnly={true} />

<style>
	.wrapper {
		height: 100%;
		width: 100%;
		background-color: var(--bw-base1);
		color: var(--bw-text);
		display: flex;
		flex-direction: column;
		gap: 1.2em;
		padding: 0.5em;
	}
	.icon {
		font-size: 4em;
	}
	.wrapper button {
		max-width: fit-content;
		border-width: 0px;
		background-color: var(--bw-base3);
		color: var(--bw-text);
		font-family: 'Inter', sans-serif;
		font-size: 1.5em;
		border-radius: 0.3em;
		padding: 0.3em;
		transition:
			background-color var(--bw-animation-delay) ease,
			color var(--bw-animation-delay) ease,
			font-weight var(--bw-animation-delay) ease;
	}
	.wrapper button:hover {
		background-color: var(--bw-blue);
		color: var(--bw-base1);
	}
	p {
		font-family: 'Inter', sans-serif;
		color: var(--bw-text);
		font-size: 1.2em;
	}
	p,
	ul {
		font-size: 1.2em;
		margin-block-start: 0.2em;
		margin-block-end: 0.2em;
	}
	a {
		font-family: 'Inter', sans-serif;
		color: var(--bw-blue);
	}
	.ualabel {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 2em;
	}
	.header {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-block-start: 0.5em;
		gap: 1em;
	}
	.title {
		font-weight: bold;
		font-size: 3em;
		line-height: 0em;
	}
</style>
