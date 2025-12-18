<script lang="ts">
	import EditorWindow from './EditorWindow.svelte';
</script>

<div id="editor-window-wrapper">
	<EditorWindow />
</div>

<style>
	#editor-window-wrapper {
		overflow: hidden;
		height: 100%;
		min-height: 0;
	}
</style>
