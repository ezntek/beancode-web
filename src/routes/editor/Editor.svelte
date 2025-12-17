<script lang="ts">
	import { onMount } from 'svelte';
	import { createEditor, type PrismEditor } from 'prism-code-editor';
	import { s } from './state.svelte';
	import 'prism-code-editor/layout.css';
	import 'prism-code-editor/themes/github-dark.css';
	import { defaultCommands } from 'prism-code-editor/commands';

	let editorContainer: HTMLDivElement | null = null;
	let editor: PrismEditor;

	const placeholder = '// welcome to beanweb!\n// start typing some code, or load an example.';

	onMount(() => {
		editor = createEditor(
			editorContainer,
			{
				lineNumbers: true,
				value: placeholder,
				tabSize: 4,
				// @ts-ignore
				theme: 'github-dark'
			},
			() => {
				console.log('loaded editor');
			},
			defaultCommands()
		);

		editor.textarea.addEventListener('input', () => {
			s.editorSrc = editor.value;
		});

		$effect(() => {
			if (editor.value !== s.editorSrc) {
				editor.textarea.value = s.editorSrc;
				editor.update();
			}
		});

		return () => {
			editor?.remove();
		};
	});
</script>

<div class="editor-wrapper" bind:this={editorContainer}></div>

<style>
	.editor-wrapper {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.editor-wrapper :global(.prism-code-editor) {
		height: 100%;
	}
</style>
