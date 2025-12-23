<script lang="ts">
	import { onMount } from 'svelte';
	import { basicSetup } from 'codemirror';
	import { EditorView, keymap } from '@codemirror/view';
	import { indentWithTab } from '@codemirror/commands';
	import { EditorState } from '@codemirror/state';
	import { catppuccinMacchiato } from '@catppuccin/codemirror';
	import { es } from './editor_state.svelte';
	import { pathName } from '$lib/fstypes';

	let editor: HTMLDivElement;

	onMount(() => {
		const updateListener = EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				const newValue = update.state.doc.toString();
				if (newValue !== es.src) es.src = newValue;
				es.saved = false;
			}
		});

		let fontSize = 21;
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
			if (view && es.src !== view.state.doc.toString()) {
				view.dispatch({
					changes: {
						from: 0,
						to: view.state.doc.length,
						insert: es.src
					}
				});
			}
		});

		return () => {
			view.destroy();
		};
	});
</script>

<div class="editor-wrapper">
	<div class="toolbar">
		<p class="label">
			{#if es.curFilePath === ''}
				[New File]
			{:else}
				{pathName(es.curFilePath)}
			{/if}
			{#if !es.saved}
				<strong style="color: var(--bw-yellow)">*</strong>
			{/if}
		</p>
	</div>
	<div class="editor" bind:this={editor}></div>
</div>

<style>
	.editor-wrapper {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.toolbar {
		background-color: var(--bw-base2);
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-shrink: 0;
	}

	.label {
		color: var(--bw-text);
		font-family: 'IBM Plex Mono', monospace;
		padding: 0;
		padding-bottom: 0.1em;
		padding-left: 0.3em;
		padding: 0.3em;
		margin: 0;
		margin-right: auto;
	}

	.editor {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
</style>
