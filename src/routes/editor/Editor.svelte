<script lang="ts">
	import { basicSetup, EditorView } from 'codemirror';
	import CodeMirror from 'svelte-codemirror-editor';
	import { s } from './state.svelte';
	import { oneDark } from '@codemirror/theme-one-dark';
	const placeholder =
		'// welcome to beanweb!\n// start typing some code, or load one of the examples.';
</script>

<div class="editor">
	<CodeMirror bind:value={s.editorSrc} theme={oneDark} extensions={[basicSetup]} {placeholder} />
</div>

<style>
	.editor {
		flex-direction: column;
		flex-shrink: 0;
		flex: 1;
		overflow: auto;
	}
	.cm-editor {
		display: flex;
		width: 100% !important;
		height: 100%;
	}
	.cm-scroller {
		overflow: auto;
	}
</style>
