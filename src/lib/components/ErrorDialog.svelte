<!--
 Beancode Web

 Copyright (c) 2026-present Eason Qin <eason@ezntek.com>

 This Source Code Form is subject to the terms of the Mozilla Public
 license, v. 2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at https://mozilla.org/MPL/2.0/.
-->

<script lang="ts">
	import Dialog from './Dialog.svelte';

	let innerDialog: Dialog;
	let submitButton: HTMLButtonElement;
	let after: Function | undefined;
	let messages: string[] = $state([]);

	// @ts-ignore
	export const close = () => {
		innerDialog.close();
		if (after) after();
	};
	// @ts-ignore
	export const open = (msgs: string[], aft?: Function) => {
		messages = [];
		after = aft;
		msgs.forEach((itm) => messages.push(itm));
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
			<p class="title"><strong>Error</strong></p>
		</div>
		<div class="middle">
			{#each messages as msg, i}
				<p class="label">{msg}</p>
				{#if i !== messages.length}
					<br />
				{/if}
			{/each}
		</div>
		<div class="bottom">
			<button
				class="ok"
				bind:this={submitButton}
				onclick={() => {
					close();
				}}
			>
				Ok
			</button>
		</div>
	</div>
</Dialog>

<style>
	.vstack {
		font-family: 'IBM Plex Mono', monospace !important;
		display: flex;
		flex-direction: column;
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
		color: var(--bw-text);
		font-weight: bold;
		transition:
			background-color 130ms ease,
			color 130ms ease,
			font-weight 130ms ease;
	}

	.bottom .ok {
		background-color: var(--bw-surface1);
	}

	.bottom .ok:hover {
		background-color: var(--bw-base1);
		color: var(--bw-subtext1);
	}

	.label {
		color: var(--bw-text);
		margin: 0;
		margin-right: 0.8em;
		padding: 0;
	}

	.title {
		color: var(--bw-red);
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
