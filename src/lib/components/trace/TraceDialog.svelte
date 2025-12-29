<script lang="ts">
	import { defaultTracerConfig, getTraceableVars, type TracerConfig } from '$lib/tracer';
	import Dialog from '$lib/components/Dialog.svelte';

	interface IProps {
		ok: (vars: string[], config: TracerConfig) => void;
		cancel: Function;
	}
	let { ok, cancel }: IProps = $props();

	let innerDialog: Dialog;
	let submitButton: HTMLButtonElement;
	let src = $state('');
	let allVars: string[] = [];
	let availableVars: string[] = $state([]);
	let usedVars: string[] = $state([]);

	let vars: string[] = $state([]);
	let config = $state(defaultTracerConfig());
	type TView = 'vars' | 'settings';
	let view: TView = $state('vars');

	function pickerChanged(e: any) {
		const newVal = e.target.value.slice();
		if (newVal !== '') {
			usedVars.push(newVal);
			usedVars.sort();
			setTimeout(() => {
				e.target.value = '';
				availableVars = availableVars.filter((s) => s !== newVal);
			}, 350);
		}
	}

	function addAll() {
		usedVars = allVars;
		availableVars = [];
	}

	function deleteAll() {
		usedVars = [];
		availableVars = allVars;
	}

	function delItem(itm: string) {
		availableVars.push(itm);
		availableVars.sort();
		usedVars = usedVars.filter((s) => s !== itm);
	}

	// @ts-ignore
	export const close = () => {
		innerDialog.close();
	};
	// @ts-ignore
	export const open = (s: string) => {
		src = s;
		allVars = getTraceableVars(s).sort();
		availableVars = [];
		usedVars = allVars;
		view = 'vars';
		innerDialog.open();
		setTimeout(() => focus(), 0);
	};

	export function focus() {
		submitButton.focus();
	}

	function selectorStyle(name: TView): string {
		if (name === view) return 'selector-selected';
		return '';
	}

	function submit() {
		ok(vars, config);
		innerDialog.close();
		return;
	}
</script>

<Dialog bind:this={innerDialog}>
	<div class="vstack">
		<div class="top">
			<button
				aria-label="close"
				class="exit-button"
				onclick={() => {
					cancel();
					close();
				}}
			>
				<span class="fa-solid fa-x"></span>
			</button>
			<p class="title"><strong>Trace</strong></p>
		</div>
		<div class="selector">
			<button
				onclick={() => {
					view = 'vars';
				}}
				class={selectorStyle('vars')}
			>
				VARIABLES
			</button>
			<button
				onclick={() => {
					view = 'settings';
				}}
				class={selectorStyle('settings')}
			>
				SETTINGS
			</button>
		</div>
		<div class="middle">
			{#if view === 'vars'}
				<p class="subtext">Add the variables you want to trace:</p>
				<div class="varlist">
					<div class="picker-row">
						<select class="picker" style="flex: 1;" onchange={pickerChanged}>
							<option value="">
								{#if availableVars.length !== 0}
									--- add something ---
								{:else}
									--- nothing to add ---
								{/if}
							</option>
							{#each availableVars as varName}
								<option value={varName}>{varName}</option>
							{/each}
						</select>
						<button
							aria-label="add all"
							title="Add all available variables"
							class="picker-button addall"
							onclick={() => addAll()}
						>
							<span class="fa-solid fa-plus"></span>
						</button>
						<button
							aria-label="delete all"
							title="Remove all added variables"
							class="picker-button deleteall"
							onclick={() => deleteAll()}
						>
							<span class="fa-solid fa-trash"></span>
						</button>
					</div>
					{#each usedVars as varName}
						<div class="var-row">
							<p class="label">{varName}</p>
							<button
								aria-label="delete variable"
								class="delete variable"
								onclick={() => delItem(varName)}
							>
								<span class="fa-solid fa-trash" style="color: var(--bw-red)"></span>
							</button>
						</div>
					{/each}
				</div>
			{:else if view === 'settings'}
				<p class="label">settings</p>
			{/if}
		</div>
		<div class="bottom">
			<button class="ok" bind:this={submitButton} onclick={() => submit()}>
				<span class="fa-solid fa-check" style="margin-right: 0.4em;"></span>Trace
			</button>
			<button
				class="cancel"
				onclick={() => {
					cancel();
					close();
				}}
			>
				<span class="fa-solid fa-x" style="margin-right: 0.4em;"></span>Cancel
			</button>
		</div>
	</div>
</Dialog>

<style>
	.vstack {
		font-family: 'IBM Plex Mono', monospace !important;
		display: flex;
		flex-direction: column;
		width: 23vw;
		min-height: 28vw;
	}

	.var-row {
		display: flex;
		flex-direction: row;
		margin-top: 0.5em;
		background-color: var(--bw-base3);
		border-radius: 0.2em;
		position: relative;
		padding: 0em;
		padding-left: 0.3em;
		padding-right: 0.3em;
		transition:
			background-color 130ms ease,
			color 130ms ease;
	}

	.var-row > p {
		flex: 1;
		min-width: 0;
		margin-right: auto;
		font-weight: normal;
		transition: font-weight 130ms ease;
	}

	.var-row > button {
		border: 0px;
		background-color: transparent;
		pointer-events: 0;
		opacity: 0;
		margin: 0.1 0 0.1 0em;
		padding: 0px;
	}

	.var-row:hover {
		background-color: var(--bw-surface1);
	}

	.var-row:hover > button {
		opacity: 1;
		pointer-events: auto;
	}

	.var-row:hover > p {
		font-weight: bold;
	}

	.varlist {
		display: flex;
		flex-direction: column;
	}

	.picker-row {
		display: flex;
		flex-direction: row;
		gap: 0.3em;
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

	.picker-button {
		border: 0px solid black;
		color: var(--bw-base1);
		font-family: 'IBM Plex Mono', monospace;
		border-radius: 0.2em;
		transition:
			background-color 130ms ease,
			color 130ms ease,
			font-weight 130ms ease;
	}

	.addall {
		background-color: var(--bw-cyan);
	}

	.addall:hover {
		background-color: var(--bw-surface1);
		color: var(--bw-cyan);
	}

	.deleteall {
		background-color: var(--bw-red);
	}

	.deleteall:hover {
		background-color: var(--bw-surface1);
		color: var(--bw-red);
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
		flex: 1;
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

	.label {
		color: var(--bw-text);
		margin: 0;
		margin-right: 0.8em;
		padding: 0;
	}

	.subtext {
		color: var(--bw-subtext1);
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
