<!--
 Beancode Web

 Copyright (c) 2026-present Eason Qin <eason@ezntek.com>

 This source code form is licensed under the GNU Affero General Public
 License version 3 (or later). If you cannot locate the LICENSE.md file at
 the root of the project, visit <http://www.gnu.org/licenses/> for more
 information.
-->

<script lang="ts">
	import { BEANCODE_COMMIT_HASH, BEANCODE_WEB_VERSION, WANTED_PYODIDE_VERSION } from '$lib/version';
	import { post } from '$lib/workers/pyodide_state.svelte';
	import { editorNewFile } from '../../routes/editor/editor_state.svelte';
	import { s } from '../../routes/editor/state.svelte';
	import Dialog from './Dialog.svelte';
	import { UAParser } from 'ua-parser-js';

	interface IProps {
		aboutOnly: boolean;
	}
	let { aboutOnly }: IProps = $props();

	let innerDialog: Dialog;
	let submitButton: HTMLButtonElement;
	const possibleViews = ['general', 'advanced', 'about', 'license'] as const;
	type TView = (typeof possibleViews)[number];

	// yes, we only want the initial state
	let view: TView = $state(aboutOnly ? 'about' : 'general');

	const result = new UAParser().getResult();
	let ua = `${result.browser.name} ${result.browser.version} on ${result.os.name}`;
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

	function clearData() {
		window.localStorage.clear();
		editorNewFile();
		post({ kind: 'nuke' });
	}
</script>

<Dialog bind:this={innerDialog}>
	<div class="vstack">
		<div class="top">
			<button aria-label="close" class="exit-button" onclick={() => close()}>
				<span class="fa-solid fa-x"></span>
			</button>
			<p class="title"><strong>Settings</strong></p>
		</div>
		<div class="selector">
			{#if aboutOnly}
				{#each ['about', 'license'] as viewName}
					<button
						onclick={() => {
							// @ts-ignore
							view = viewName;
						}}
						class={selectorStyle(viewName)}
					>
						{viewName.toUpperCase()}
					</button>
				{/each}
			{:else}
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
			{/if}
		</div>
		<div class="middle">
			{#if view === 'general'}
				<h1>General Settings</h1>
				<p style="color: var(--bw-subtext1);">nothing to see here...</p>
			{:else if view === 'advanced'}
				<h1>Advanced Settings</h1>
				<button class="button destructive-button" onclick={() => clearData()}>
					<span class="fa-solid fa-trash"></span>
					Clear all user data
				</button>
			{:else if view == 'about'}
				<h1>About beancode web</h1>
				<p>
					Beancode web aims to be a portable, simple and friendly web IDE for IGCSE Computer Science
					(0478, 2210) Pseudocode and Python, designed for students and teachers who may not be very
					comfortable nor experienced with traditional text editors/IDEs.
				</p>
				<p>
					This project is copyright (c) Eason Qin, 2025-2026. View the license tab for more
					information.
				</p>
				<hr />
				<p><strong>Version info</strong></p>
				<table>
					<tbody>
						<tr>
							<td>beancode web</td><td><strong>{BEANCODE_WEB_VERSION}</strong> </td>
						</tr>
						<tr>
							<td>commit hash</td><td><strong>{BEANCODE_COMMIT_HASH}</strong></td>
						</tr>
						<tr>
							<td>platform</td><td><strong>{ua}</strong></td>
						</tr>
						{#if s.versionText !== ''}
							<tr>
								<td>beancode</td><td><strong>{s.versionText}</strong></td>
							</tr>
							<tr>
								<td>Pyodide</td><td><strong>{WANTED_PYODIDE_VERSION}</strong></td>
							</tr>
							<tr>
								<td>Python</td><td><strong>{s.pyVersion}</strong></td>
							</tr>
						{/if}
					</tbody>
				</table>
			{:else if view == 'license'}
				<h1>License</h1>
				<p>
					Beancode Web is copyright (c) Eason Qin 2025-2026. It is licensed under the GNU Affero
					General Public License, version 3.0 (or later).
				</p>
				<p>
					If you would like to browse the GNU Affero General Public License, version 3.0, online,
					you may visit
					<a href="https://www.gnu.org/licenses/agpl-3.0.en.html#license-text" target="_blank">
						https://www.gnu.org/licenses/agpl-3.0.en.html#license-text
					</a>.
				</p>
				<hr />
				<p>Beancode is licensed under the Mozilla Public License, v2.0.</p>
				<p>Pyodide is licensed under the Mozilla Public License, v2.0.</p>
				<p>
					If you would like to browse the Mozilla Public License, v. 2.0, online, you may visit
					<a href="http://mozilla.org/MPL/2.0/" target="_blank">http://mozilla.org/MPL/2.0/</a>.
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

	.middle h1 {
		font-size: 16pt;
		color: var(--bw-text);
		margin: 0;
		margin-bottom: 0.5em;
	}

	.middle p {
		color: var(--bw-text);
		margin: 0;
		margin-right: 0.8em;
		padding: 0;
	}

	.middle a {
		color: var(--bw-blue);
	}

	.middle hr {
		border-color: var(--bw-subtext1);
		width: 100%;
	}

	.middle table {
		table-layout: fixed;
		border-collapse: collapse;
	}

	.middle tbody,
	.middle td {
		color: var(--bw-text);
		border: 1px solid var(--bw-subtext1);
		border-color: var(--bw-subtext1);
	}
	.middle td {
		padding: 0.2em;
		width: min-content;
	}
	.middle td:last-child {
		width: auto;
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
		display: flex;
		justify-content: center;
		align-items: center;
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
