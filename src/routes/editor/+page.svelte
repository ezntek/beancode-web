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

	import EditorWindow from './EditorWindow.svelte';
	import '@fontsource/inter/400';
	import '@fontsource/inter/500';
	import '@fontsource/inter/600';
	import '@fontsource/inter/700';

	import '@fontsource/ibm-plex-mono/400';
	import '@fontsource/ibm-plex-mono/700';
	import UnsupportedWindow from './UnsupportedWindow.svelte';

	let hasSab = true;
	onMount(() => {
		const theme = window.localStorage.getItem('EditorTheme');
		if (theme) {
			s.themeName = theme;
		}
		applyTheme(s.themeName);

		try {
			var dummy: any;
			dummy = SharedArrayBuffer;
			dummy = Atomics;
		} catch (err) {
			hasSab = false;
		}

		if (navigator.storage && navigator.storage.persist) {
			try {
				navigator.storage.persist().then((persistent: boolean) => {
					if (!persistent)
						console.error(
							'Could not request for persistent storage, your data may mysteriously vanish.'
						);
				});
			} catch (e) {
				console.error(
					'Could not request for persistent storage, your data may mysteriously vanish.'
				);
			}
		}
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
	{#if hasSab}
		<EditorWindow />
	{:else}
		<UnsupportedWindow />
	{/if}
</div>

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
			font-size: 14px;
		}
	}
</style>
