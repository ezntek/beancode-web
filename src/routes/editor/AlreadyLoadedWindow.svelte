<script lang="ts">
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import MessageDialog from '$lib/components/MessageDialog.svelte';
	import { BEANCODE_IS_DEV_BUILD } from '$lib/constants';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

	let settingsDialog: SettingsDialog;
	let confirmDialog: ConfirmDialog;
	let messageDialog: MessageDialog;

	function openDialog() {
		const MSG = [
			'Beancode web does not send your data to servers outside your computer. All of your data (your code and settings) are stored within your web browser.',
			'However, since every instance (tab, window) of beancode web shares the same storage since you are using the same web browser, trying to use both instances at the same time can lead to data corruption, data loss, and desynchronised files/settings.'
		];
		messageDialog.open(MSG);
	}

	function nukeLocalStorage() {
		window.localStorage.clear();
	}

	function override() {
		confirmDialog.open(
			[
				'You are running the risk of weird glitches and generally undefined behavior.',
				'Beancode web may function normally to some extent, but this is not recommended. Are you sure?'
			],
			() => {
				window.localStorage.setItem('WindowCount', '0');
				const url = new URL(location.href);
				url.searchParams.set('_', Date.now().toString());
				location.replace(url.toString());
			},
			undefined
		);
	}
</script>

<div class="wrapper">
	<div class="header">
		<span class="fa-regular fa-frown icon"></span>
		<p class="title">Another instance of Beancode Web is open...</p>
	</div>
	<p class="ualabel">
		Two or more instances of Beancode Web cannot be open simultaneously. Dangerous things (like file
		corruption) may happen if this is allowed!
	</p>
	<span>
		<button onclick={() => openDialog()}>I'm confused!</button>
		<button onclick={() => settingsDialog.open()}>About</button>
		<button onclick={() => override()}>Override</button>
		{#if BEANCODE_IS_DEV_BUILD}
			<button onclick={() => nukeLocalStorage()}>Nuke localStorage</button>
		{/if}
	</span>
</div>
<MessageDialog bind:this={messageDialog} />
<ConfirmDialog bind:this={confirmDialog} />
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
