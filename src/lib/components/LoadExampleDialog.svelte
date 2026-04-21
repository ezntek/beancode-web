<!--
 Beancode Web

 Copyright (c) 2026-present Eason Qin <eason@ezntek.com>

 This source code form is licensed under the GNU Affero General Public
 License version 3 (or later). If you cannot locate the LICENSE.md file at
 the root of the project, visit <http://www.gnu.org/licenses/> for more
 information.
-->

<script lang="ts">
	import Dialog from './Dialog.svelte';

	import '$lib/styles/dialog.css';
	import FileBrowserItem from './FileBrowserItem.svelte';

	let innerDialog: Dialog;
	let submitButton: HTMLButtonElement;
	const possibleViews = ['basic', 'algorithms', 'benchmarks'] as const;
	type TView = (typeof possibleViews)[number];
	let view: TView = $state('basic');

	interface IProps {
		doneCallback: (exampleUrl: string, name: string) => void;
	}
	let { doneCallback }: IProps = $props();

	let exampleList: string[] = $state([]);

	// @ts-ignore
	export const close = () => {
		innerDialog.close();
	};
	// @ts-ignore
	export const open = () => {
		innerDialog.open();
		setTimeout(() => focus(), 0);
	};

	export function focus() {
		submitButton.focus();
	}

	function selectorStyle(name: string): string {
		if (name === view) return 'selector-selected';
		return '';
	}

	let exampleDirUrl = $derived(`/bcdata/examples/${view}`);
	// XXX: ew.
	$effect(() => {
		(async () => {
			await updateEntries();
		})();
	});

	async function updateEntries() {
		let url = exampleDirUrl + '/files.txt';
		let resp = await fetch(url);

		if (resp.status !== 200) {
			console.error(`Could not load examples at ${url}`);
			return;
		}

		let txt = await resp.text();
		exampleList = txt.split('\n').filter((s) => Boolean(s) && s[0] !== '#');
	}

	function clickItem(itm: string) {
		doneCallback(exampleDirUrl + '/' + itm, itm);
		close();
	}
</script>

<Dialog bind:this={innerDialog}>
	<div class="vstack">
		<div class="top">
			<button aria-label="close" class="exit-button" onclick={() => close()}>
				<span class="fa-solid fa-x"></span>
			</button>
			<p class="title"><strong>Load Example</strong></p>
		</div>
		<div class="selector">
			{#each possibleViews as viewName}
				<button
					onclick={() => {
						view = viewName;
					}}
					class={selectorStyle(viewName)}
				>
					{viewName.toUpperCase()}
				</button>
			{/each}
		</div>
		<div class="middle">
			<p class="label"><strong>Note:</strong> All examples are in <strong>Pseudocode</strong>.</p>
			<p class="label">
				Example file names will be prefixed with "Ex_", such as "Ex_InputOutput.bean".
			</p>
			<hr />
			<h1>Files</h1>
			{#if exampleList.length !== 0}
				{#each exampleList as itm}
					<FileBrowserItem onClick={() => clickItem(itm)} displayEllipsis={false}>
						<span class="fa-regular fa-file-code"></span>
						<span style="font-weight: normal;">{itm}</span>
					</FileBrowserItem>
				{/each}
			{:else}
				<p class="label" style="color: var(--bw-subtext1); text-align: center;">
					nothing to see here...
				</p>
			{/if}
		</div>
		<div class="bottom">
			<button
				class="button ok"
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
		min-width: 28vw;
		max-width: 35vw;
		min-height: 60vh;
		max-height: 80vh;
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
		margin-top: auto;
	}

	.button {
		font-family: 'IBM Plex Mono', monospace !important;
		padding: 0.3em;
		border-width: 0px;
		border-radius: 3px;
		color: var(--bw-text);
		font-weight: bold;
		font-size: 0.8em;
		transition:
			background-color 130ms ease,
			color 130ms ease,
			font-weight 130ms ease;
	}

	.destructive-button {
		background-color: var(--bw-red);
		color: var(--bw-base1);
	}

	.destructive-button:hover {
		background-color: var(--bw-surface1);
		color: var(--bw-red);
	}

	.ok {
		background-color: var(--bw-surface1);
	}

	.ok:hover {
		background-color: var(--bw-base1);
		color: var(--bw-subtext1);
	}

	.selector {
		display: flex;
		min-height: 0;
	}

	.selector > button {
		padding-top: 0.3em;
		padding-bottom: 0.3em;
		flex: 1;
		font-family: 'IBM Plex Mono', monospace !important;
		font-size: 0.9em;
		border: 0px;
		border-radius: 0px;
		background-color: var(--bw-base1);
		color: var(--bw-text);
		transition:
			background-color 130ms ease,
			color 130ms ease,
			font-weight 130ms ease;
	}

	.selector > button:hover {
		background-color: var(--bw-base3);
		color: var(--bw-text);
	}

	.selector-selected {
		background-color: var(--bw-base2) !important;
		font-weight: bold;
	}

	.middle p {
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

	.middle h1 {
		font-size: 16pt;
		color: var(--bw-text);
		margin-top: 0.5em;
		margin: 0;
	}

	.middle hr {
		border-color: var(--bw-subtext1);
		width: 100%;
	}
</style>
