<script lang="ts">
	import { onMount } from 'svelte';
	import { s } from './state.svelte';
	import { basicSetup } from 'codemirror';
	import { EditorView, keymap } from '@codemirror/view';
	import { indentWithTab } from '@codemirror/commands';
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

		let fontSize = 21;
		console.log(window.innerWidth, window.innerHeight);
		if (window.innerWidth <= 1366 || window.innerHeight <= 768) {
			fontSize = 18;
		}

		const style = EditorView.theme({
			'&': { height: '100%' },
			'.cm-scroller': { overflow: 'auto' },
			'.cm-content': { fontFamily: 'IBM Plex Mono', fontSize: `${fontSize}px` },
			'.cm-gutterElement': { display: 'flex', alignItems: 'center' }
		});

		const startState = EditorState.create({
			doc: '',
			extensions: [
				basicSetup,
				updateListener,
				style,
				catppuccinMacchiato,
				keymap.of([indentWithTab])
			]
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
