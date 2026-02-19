<script lang="ts">
	import AboutDialog from '$lib/components/AboutDialog.svelte';
	import MessageDialog from '$lib/components/MessageDialog.svelte';

	let messageDialog: MessageDialog;
	let aboutDialog: AboutDialog;

	function openDialog() {
		const MSG =
			'Beancode Web needs a feature in your browser called SharedArrayBuffer to function properly (to support the INPUT statement in Pseudocode and the input() function in Python). Your browser does not seem to support this, therefore Beancode Web cannot run properly.';
		messageDialog.open(MSG);
	}

	function detectUserAgent() {
		return navigator.userAgent;
	}
</script>

<div class="wrapper">
	<div class="header">
		<span class="fa-regular fa-frown icon"></span>
		<p class="title">Your browser is unsupported!</p>
	</div>
	<p class="ualabel">
		<strong>User Agent:</strong>
		{detectUserAgent()}
	</p>
	<span>
		<button onclick={() => openDialog()}>Why?</button>
		<button onclick={() => aboutDialog.open()}>About</button>
	</span>
</div>
<MessageDialog bind:this={messageDialog} />
<AboutDialog bind:this={aboutDialog} />

<style>
	.wrapper {
		height: 100%;
		width: 100%;
		background-color: var(--bw-base1);
		color: var(--bw-text);
		display: flex;
		flex-direction: column;
		gap: 1.2em;
	}
	.icon {
		font-size: 4em;
	}
	.wrapper button {
		max-width: fit-content;
		border-width: 0px;
		background-color: var(--bw-base3);
		color: var(--bw-text);
		font-size: 1.5em;
		border-radius: 0.3em;
		padding: 0.3em;
		transition:
			background-color 130ms ease,
			color 130ms ease,
			font-weight 130ms ease;
	}
	.wrapper button:hover {
		background-color: var(--bw-blue);
		color: var(--bw-base1);
	}
	.ualabel {
		font-family: 'IBM Plex Mono', monospacE;
		font-size: 2em;
	}
	.header {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1em;
	}
	.title {
		font-weight: bold;
		font-size: 3em;
		line-height: 0em;
	}
</style>
