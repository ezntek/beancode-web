<script lang="ts">
	import { onMount } from 'svelte';
	import { s } from './state.svelte';
	import { basicSetup, EditorView } from 'codemirror';
	import { EditorState } from '@codemirror/state';
	import { catppuccinMacchiato } from '@catppuccin/codemirror';

	let editor: HTMLDivElement;

	onMount(() => {
		const updateListener = EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				const newValue = update.state.doc.toString();
				if (newValue !== s.editorSrc) s.editorSrc = newValue;
			}
		});

		const style = EditorView.theme({
			'&': { height: '100%' },
			'.cm-scroller': { overflow: 'auto' },
			'.cm-content': { fontFamily: 'IBM Plex Mono', fontSize: '15pt' },
			'.cm-gutterElement': { display: 'flex', alignItems: 'center' }
		});

		const startState = EditorState.create({
			doc: '',
			extensions: [basicSetup, updateListener, style, catppuccinMacchiato]
		});

		const view = new EditorView({
			// @ts-ignore
			parent: editor,
			state: startState
		});

		$effect(() => {
			if (view && s.editorSrc !== view.state.doc.toString()) {
				view.dispatch({
					changes: {
						from: 0,
						to: view.state.doc.length,
						insert: s.editorSrc
					}
				});
			}
		});

		return () => {
			view.destroy();
		};
	});
</script>

<div class="editor-wrapper" bind:this={editor}></div>

<style>
	.editor-wrapper {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
</style>
