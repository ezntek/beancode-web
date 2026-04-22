<!--
 Beancode Web

 Copyright (c) 2026-present Eason Qin <eason@ezntek.com>

 This source code form is licensed under the GNU Affero General Public
 License version 3 (or later). If you cannot locate the LICENSE.md file at
 the root of the project, visit <http://www.gnu.org/licenses/> for more
 information.
-->

<script lang="ts">
	import { BEANCODE_WEB_VERSION, WANTED_PYODIDE_VERSION } from '$lib/version';
	import { BEANCODE_COMMIT_HASH } from '$lib/constants';
	import { post } from '$lib/workers/pyodide_state.svelte';
	import { editorNewFile } from '../../routes/editor/editor_state.svelte';
	import { s } from '../../routes/editor/state.svelte';
	import Dialog from './Dialog.svelte';
	import { UAParser } from 'ua-parser-js';

	import '$lib/styles/dialog.css';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import { getDefaultConfig, isValidConfig, type IConfig } from '$lib/config';
	import ThemePickerRow from '$lib/components/settings/ThemePickerRow.svelte';
	import ErrorDialog from './ErrorDialog.svelte';

	interface IProps {
		aboutOnly: boolean;
		cfg?: IConfig;
		onClose?: (cfg: IConfig) => void;
	}
	let { aboutOnly, cfg = $bindable(getDefaultConfig()), onClose }: IProps = $props();

	let confirmDialog: ConfirmDialog;
	let errorDialog: ErrorDialog;
	let innerDialog: Dialog;
	let uploadElem: HTMLInputElement;
	let submitButton: HTMLButtonElement;

	// copy the state so that we don't trigger too many $effect's while the user is in the menu
	let ourCfg = $state({ ...cfg } satisfies IConfig);

	const possibleViews = ['general', 'advanced', 'about', 'license'] as const;
	type TView = (typeof possibleViews)[number];

	// yes, we only want the initial state
	let view: TView = $state('about');

	const result = new UAParser().getResult();
	let ua = `${result.browser.name} ${result.browser.version} on ${result.os.name}`;
	// @ts-ignore
	export const close = () => {
		s.themeName = origTheme;
		innerDialog.close();
	};

	// @ts-ignore
	export const open = () => {
		view = aboutOnly ? 'about' : 'general';
		ourCfg = { ...cfg } satisfies IConfig;

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
		const nuke = () => {
			editorNewFile();
			post({ kind: 'nuke' });
		};
		confirmDialog.open(
			[
				'This will remove ALL user data that you have, including all your settings and files.',
				'This action is IRREVERSIBLE. Are you SURE you want to do this?',
				'This feature is mostly intended for developers; make a backup of your files before you click.'
			],
			nuke,
			undefined
		);
	}

	function downloadSettings() {
		const blob = new Blob([JSON.stringify(ourCfg)], { type: 'text/plain' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'beancode_web_settings.json';
		a.click();
		URL.revokeObjectURL(a.href);
	}

	async function uploadSettings(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.item(0);

		if (!file) return;

		const txt = await file.text();
		let res;
		try {
			res = JSON.parse(txt);

			if (!isValidConfig(res)) {
				errorDialog.open([`${file.name} is an invalid configuration!`]);
				return;
			}
		} catch (e) {
			errorDialog.open([`Could not parse ${file.name}`, String(e)]);
			return;
		}

		ourCfg = res satisfies IConfig;
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
				<hr />
				<table class="option-table">
					<tbody>
						<ThemePickerRow
							label="Preferred Light Theme"
							value={ourCfg.preferredLightTheme}
							onChange={(v) => (ourCfg.preferredLightTheme = v)}
						/>
						<ThemePickerRow
							label="Preferred Dark Theme"
							value={ourCfg.preferredDarkTheme}
							onChange={(v) => (ourCfg.preferredDarkTheme = v)}
						/>
						<tr>
							<td><span class="label">Editor Font</span></td>
							<td
								><input
									type="text"
									spellcheck="false"
									class="input-box"
									bind:value={ourCfg.editorFont}
								/></td
							>
						</tr>
						<tr>
							<td><span class="label">Editor Font Size</span></td>
							<td
								><input
									type="number"
									spellcheck="false"
									class="input-box"
									bind:value={ourCfg.editorFontSize}
								/></td
							>
						</tr>
						<tr>
							<td><span class="label">Terminal Font</span></td>
							<td
								><input
									type="text"
									spellcheck="false"
									class="input-box"
									bind:value={ourCfg.terminalFont}
								/></td
							>
						</tr>
						<tr>
							<td><span class="label">Terminal Font Size</span></td>
							<td
								><input
									type="number"
									spellcheck="false"
									class="input-box"
									bind:value={ourCfg.terminalFontSize}
								/></td
							>
						</tr>
					</tbody>
				</table>
			{:else if view === 'advanced'}
				<h1>Advanced Settings</h1>
				<hr />
				<button
					class="button normal"
					onclick={() => {
						downloadSettings();
					}}
				>
					<span class="fa-solid fa-download"></span> Download Settings
				</button>
				<button
					class="button normal"
					onclick={() => {
						uploadElem.click();
					}}
				>
					<span class="fa-solid fa-upload"></span> Upload Settings
				</button>
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
				<table class="info-table">
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
					if (onClose) onClose(ourCfg);
					close();
				}}
			>
				<span class="fa-solid fa-check"></span> Ok
			</button>
		</div>
	</div>
</Dialog>
<ConfirmDialog bind:this={confirmDialog} />
<ErrorDialog bind:this={errorDialog} />
<input bind:this={uploadElem} type="file" accept=".json,text/*" onchange={uploadSettings} hidden />

<style>
	.vstack {
		font-family: 'IBM Plex Mono', monospace !important;
		display: flex;
		flex-direction: column;
		min-width: 35vw;
		max-width: 35vw;
		min-height: 35vw;
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
		gap: 0.5em;
		margin-top: auto;
	}

	.label {
		color: var(--bw-text);
		margin: 0;
		margin-right: 0.8em;
		padding: 0;
	}

	.row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.input-box {
		font-family: 'IBM Plex Mono', monospace !important;
		background-color: var(--bw-base1);
		border-radius: 5px;
		border: 0px solid black;
		flex: 1;
		color: var(--bw-text);
		font-size: 1.1em;
		width: 100%;
	}

	.input-box:focus {
		background-color: var(--bw-surface1);
		outline: 0px solid black;
		caret-shape: block;
		caret-color: var(--bw-blue);
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

	.normal {
		background-color: var(--bw-surface1);
		color: var(--bw-text);
	}

	.normal:hover {
		background-color: var(--bw-surface2);
	}

	.ok {
		background-color: var(--bw-green);
		color: var(--bw-base1);
	}

	.ok:hover {
		background-color: var(--bw-base3);
		color: var(--bw-green);
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

	.middle h1 {
		font-size: 16pt;
		color: var(--bw-text);
		margin: 0;
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

	.option-table {
		border-collapse: separate;
		border-spacing: 0 0.5em;
	}

	.option-table tbody {
		border: 0px solid black;
		border: 0px solid black;
	}

	.option-table td {
		margin-bottom: 0.3em;
		border: 0px solid black;
	}

	.option-table :global(td):first-child {
		width: 40%;
	}

	.info-table {
		table-layout: fixed;
		border-collapse: collapse;
	}

	.info-table tbody,
	.info-table td {
		color: var(--bw-text);
		border: 1px solid var(--bw-subtext1);
		border-color: var(--bw-subtext1);
		padding: 0.2em;
	}

	.info-table td {
		width: min-content;
	}
	.info-table td:last-child {
		width: auto;
	}

	.title {
		color: var(--bw-text);
		padding: 0px;
		margin: 0px;
		margin-left: 0.8em;
	}
</style>
