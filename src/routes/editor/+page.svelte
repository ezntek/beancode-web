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

	onMount(() => {
		s.themeName = 'catppuccin_macchiato';
		applyTheme(s.themeName);
	});
</script>

<div id="editor-window-wrapper">
	<EditorWindow />
</div>

<style>
	#editor-window-wrapper {
		height: calc(100vh - 0.8em);
		min-height: 0;
		padding: 0.4em;
		overflow: hidden;
		background-color: var(--bw-base1);
		scrollbar-width: 0;

		font-family: 'Inter', sans-serif;
	}
</style>
