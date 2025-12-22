<script lang="ts">
	import { pathExtension } from '$lib/fstypes';
	import Dialog from './Dialog.svelte';
	import ErrorDialog from './ErrorDialog.svelte';

	interface IProps {
		ok: (fileName: string) => void;
		cancel: Function;
		title?: string;
	}
	let { ok, cancel, title = 'Save' }: IProps = $props();

	function submitOk() {
		// throw it on the event loop for good measure
		if (fileName === '') {
			errorDialog.open('Cannot save to empty file name!');
			return;
		}

		setTimeout(() => {
			const n = fileName.slice();
			let name = n;
			if (pathExtension(n) !== fileType) {
				const t = fileType.slice();
				name += t !== '' ? '.' + t : '';
			}
			ok(name);
			innerDialog.close();
			fileName = '';
		}, 0);
	}

	function submitCancel() {
		fileName = '';
		fileType = 'bean';
		setTimeout(() => {
			cancel();
			innerDialog.close();
		}, 0);
	}

	let innerDialog: Dialog;
	let errorDialog: ErrorDialog;
	let submitButton: HTMLButtonElement;
	let fileName = $state('');
	let fileType = $state('bean');

	// @ts-ignore
	export const close = () => {
		fileName = '';
		innerDialog.close();
	};
	// @ts-ignore
	export const open = (t?: string) => {
		if (t) title = t;

		innerDialog.open();
		setTimeout(() => focus(), 0);
	};

	export function focus() {
		submitButton.focus();
	}
</script>

<Dialog bind:this={innerDialog}>
	<div class="vstack">
		<div class="top">
			<button aria-label="close" class="exit-button" onclick={() => close()}>
				<span class="fa-solid fa-x"></span>
			</button>
			<p class="title"><strong>{title}</strong></p>
		</div>
		<div class="middle">
			<div class="row">
				<p class="label">Name:</p>
				<input type="text" bind:value={fileName} />
			</div>
			<div class="row">
				<p class="label">Type:</p>
				<select class="picker" style="flex: 1;" bind:value={fileType}>
					<option value="bean" selected>Pseudocode (.bean)</option>
					<option value="py">Python (.py)</option>
					<option value="txt">Text (.txt)</option>
					<option value="">No File Extension</option>
				</select>
			</div>
		</div>
		<div class="bottom">
			<button class="ok" onclick={submitOk} bind:this={submitButton}>
				<span class="fa-solid fa-check" style="margin-right: 0.4em;"></span>Ok
			</button>
			<button class="cancel" onclick={submitCancel}>
				<span class="fa-solid fa-x" style="margin-right: 0.4em;"></span>Cancel
			</button>
		</div>
	</div>
</Dialog>
<ErrorDialog bind:this={errorDialog} />

<style>
	.vstack {
		font-family: 'IBM Plex Mono', monospace !important;
		display: flex;
		flex-direction: column;
		width: 20vw;
	}

	.top {
		display: flex;
		flex-direction: row;
		align-items: left;
		align-content: center;
		min-width: 0;
		background-color: var(--bw-surface1);
		padding: 0.4em 0.5em 0.4em 0.5em;
	}

	.middle {
		display: flex;
		flex-direction: column;
		margin: 0.5em;
		gap: 0.5em;
		margin-bottom: 3em;
	}

	.bottom {
		display: flex;
		flex-direction: row;
		justify-content: right;
		margin: 0.5em;
		margin-top: 0px;
		gap: 0.5em;
	}

	.bottom button {
		font-family: 'IBM Plex Mono', monospace !important;
		padding: 0.3em;
		border-width: 0px;
		border-radius: 3px;
		color: var(--bw-base1);
		font-weight: bold;
		transition:
			background-color 130ms ease,
			color 130ms ease,
			font-weight 130ms ease;
	}

	.bottom .ok {
		background-color: var(--bw-green);
	}

	.bottom .ok:hover {
		background-color: var(--bw-base1);
		color: var(--bw-green);
	}

	.bottom .cancel {
		background-color: var(--bw-red);
	}

	.bottom .cancel:hover {
		background-color: var(--bw-base1);
		color: var(--bw-red);
	}

	.row {
		display: flex;
		flex-direction: row;
	}

	.row input {
		font-family: 'IBM Plex Mono', monospace !important;
		background-color: var(--bw-base1);
		border-radius: 5px;
		border: 0px solid black;
		flex: 1;
		color: var(--bw-text);
		font-size: 13pt;
	}

	.row input:focus {
		background-color: var(--bw-surface1);
		outline: 0px solid black;
		caret-shape: block;
		caret-color: var(--bw-blue);
	}

	.picker {
		font-family: 'IBM Plex Mono', monospace !important;
		font-size: 12pt;
		border-width: 0px;
		border-radius: 3px;
		background-color: var(--bw-surface1);
		color: var(--bw-text);
		font-weight: bold;
	}

	.label {
		font-weight: bold;
		color: var(--bw-text);
		margin: 0;
		margin-right: 0.8em;
		padding: 0;
	}

	.title {
		color: var(--bw-text);
		padding: 0px;
		margin: 0px;
		margin-left: 0.8em;
	}

	.exit-button {
		border: 0px solid black;
		border-radius: 5px;
		background-color: var(--bw-red);
		color: var(--bw-base1);
		text-align: center;
		width: 1.5em;
		height: 1.5em;
		transition:
			background-color 130ms ease,
			color 130ms ease,
			font-weight 130ms ease;
	}

	.exit-button:hover {
		background-color: var(--bw-base1);
		color: var(--bw-red);
	}
</style>
