<!--
 Beancode Web

 Copyright (c) 2026-present Eason Qin <eason@ezntek.com>

 This source code form is licensed under the GNU Affero General Public
 License version 3 (or later). If you cannot locate the LICENSE.md file at
 the root of the project, visit <http://www.gnu.org/licenses/> for more
 information.
-->

<script lang="ts">
	import { applyTheme } from '$lib/themes/themes';
	import { onMount } from 'svelte';
	import { s } from './state.svelte';

	import '@fontsource/inter/400';
	import '@fontsource/inter/500';
	import '@fontsource/inter/600';
	import '@fontsource/inter/700';

	import '@fontsource/ibm-plex-mono/400';
	import '@fontsource/ibm-plex-mono/700';

	import '@fontsource/fira-code/400';
	import '@fontsource/fira-code/700';

	import '@fontsource/dejavu-mono/400';
	import '@fontsource/dejavu-mono/700';

	import '@fontsource/ubuntu-mono/400';
	import '@fontsource/ubuntu-mono/700';

	import '@fontsource/noto-mono/400';

	import '@fontsource/roboto-mono/400';
	import '@fontsource/roboto-mono/700';

	import AlreadyLoadedWindow from './AlreadyLoadedWindow.svelte';
	import EditorWindow from './EditorWindow.svelte';
	import UnsupportedWindow from './UnsupportedWindow.svelte';
	import { BEANCODE_IS_DEV_BUILD } from '$lib/constants';
	import { getDefaultConfig, type IConfig } from '$lib/config';

	import ErrorDialog from '$lib/components/ErrorDialog.svelte';

	let hasSab = $state(true);
	let windowCount = $state(1);
	let errorDialog: ErrorDialog;

	onMount(() => {
		const cfg = window.localStorage.getItem('Config');
		if (cfg !== null) {
			s.config = JSON.parse(cfg) satisfies IConfig;
		} else {
			s.config = getDefaultConfig();
		}

		const theme = window.localStorage.getItem('EditorTheme');
		if (theme && (theme == s.config.preferredDarkTheme || theme == s.config.preferredLightTheme)) {
			s.themeName = theme;
		} else {
			s.themeName = s.config.preferredDarkTheme;
		}
		s.loadedTheme = true;
		applyTheme(s.themeName, s.loadedTheme);

		try {
			SharedArrayBuffer;
			Atomics;
		} catch (err) {
			hasSab = false;
		}

		function noPersistErr() {
			if (window.localStorage.getItem('ShownPersistError') !== 'yes') {
				errorDialog.open(
					[
						'Could not request for persistent storage! Your data and settings could mysteriously vanish.',
						"Either bookmark this site, manually allow persistent storage in the browser's settings, or run the risk of your data vanishing!",
						'This error will not appear again.'
					],
					() => window.localStorage.setItem('ShownPersistError', 'yes')
				);
			}
		}

		if (navigator.storage && navigator.storage.persist) {
			try {
				navigator.storage.persist().then((persistent: boolean) => {
					if (!persistent) noPersistErr();
				});
			} catch (e) {
				noPersistErr();
			}
		}

		// XXX: cursed JS
		windowCount = +(window.localStorage.getItem('WindowCount') ?? '0');
		window.localStorage.setItem('WindowCount', String(windowCount + 1));

		window.addEventListener('beforeunload', (event) => {
			windowCount = +(window.localStorage.getItem('WindowCount') ?? '0');
			window.localStorage.setItem('WindowCount', String(windowCount - 1));

			const cfg = JSON.stringify(s.config);
			window.localStorage.setItem('Config', cfg);

			event.returnValue = '';
		});
	});
</script>

<noscript>
	<style>
		#editor-window-wrapper {
			display: none;
		}
		#nojs {
			height: 100vh;
			background-color: #0873cc;
			color: white;
			padding: 5%;
		}
	</style>
	<div id="nojs">
		<h1 style="font-size: 100px; margin: 0px; padding: 0px;">:(</h1>
		<h1 style="font-size: 45px;">Oops!</h1>
		<p style="font-size: 1.2em;">
			Beancode Web requires <strong>JavaScript</strong>, WebAssembly, SharedArrayBuffer and Atomics
			support to run.
		</p>
		<p>Your PC did not in fact run into a problem.</p>
	</div>
</noscript>
<div id="editor-window-wrapper">
	{#if windowCount >= 1 && !BEANCODE_IS_DEV_BUILD}
		<AlreadyLoadedWindow />
	{:else if hasSab}
		<EditorWindow />
	{:else}
		<UnsupportedWindow />
	{/if}
</div>
<ErrorDialog bind:this={errorDialog} />

<style>
	#editor-window-wrapper {
		height: calc(100vh - 0.8em);
		min-height: 0;
		padding: 0.4em;
		overflow: hidden;
		background-color: var(--bw-base1);
		scrollbar-width: 0;
		font-weight: normal;
		font-family: 'Inter', sans-serif;
	}

	@media (max-width: 1400px), (max-height: 800px) {
		#editor-window-wrapper > :global(*) {
			font-size: 13px;
		}
	}
</style>
