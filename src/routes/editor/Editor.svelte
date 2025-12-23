<script lang="ts">
	import { onMount } from 'svelte';
	import { basicSetup } from 'codemirror';
	import { EditorView, keymap } from '@codemirror/view';
	import { indentWithTab } from '@codemirror/commands';
	import { Compartment, EditorState } from '@codemirror/state';
	import { es } from './editor_state.svelte';
	import { pathBasename } from '$lib/fstypes';
	import { catppuccinMacchiato } from '$lib/themes/catppuccin';

	let editor: HTMLDivElement;
	let view: EditorView;
	let sz = $state(21);
	let fontTheme: Compartment;

	onMount(() => {
		fontTheme = new Compartment();
		const updateListener = EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				const newValue = update.state.doc.toString();
				if (newValue !== es.src) es.src = newValue;
				es.saved = false;
			}
		});

		sz = 21;
		if (window.innerWidth <= 1366 || window.innerHeight <= 768) {
			sz = 16;
		}

		const style = EditorView.theme({
			'&': { height: '100%' },
			'.cm-scroller': { overflow: 'auto' },
			'.cm-content': { fontFamily: 'IBM Plex Mono' },
			'.cm-gutterElement': { display: 'flex', alignItems: 'center' }
		});

		const fontStyle = EditorView.theme({
			'.cm-content': { fontSize: sz + 'px' }
		});

		const startState = EditorState.create({
			doc: '',
			extensions: [
				catppuccinMacchiato,
				basicSetup,
				updateListener,
				style,
				fontTheme.of(fontStyle),
				keymap.of([indentWithTab])
			]
		});

		view = new EditorView({
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

	function zoomIn() {
		sz += 1;
		const newTheme = EditorView.theme({
			'.cm-content': { fontSize: `${sz}px` }
		});
		view.dispatch({ effects: fontTheme.reconfigure(newTheme) });
	}

	function zoomOut() {
		sz -= 1;
		const newTheme = EditorView.theme({
			'.cm-content': { fontSize: `${sz}px` }
		});
		view.dispatch({ effects: fontTheme.reconfigure(newTheme) });
	}
</script>

<div class="editor-wrapper">
	<div class="toolbar">
		<p class="label">
			{#if es.curFilePath === ''}
				[New File]
			{:else}
				{pathBasename(es.curFilePath)}
			{/if}
			{#if !es.saved}
				<strong style="color: var(--bw-yellow)">*</strong>
			{/if}
		</p>
		<button aria-label="zoom in" class="toolbar-button zoomout" onclick={() => zoomOut()}>
			<span class="fa-solid fa-minus"></span>
		</button>
		<button aria-label="zoom in" class="toolbar-button zoomin" onclick={() => zoomIn()}>
			<span class="fa-solid fa-plus"></span>
		</button>
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

	.toolbar-button {
		border: 0px solid black;
		margin: 0.2em;
		color: var(--bw-base1);
		font-family: 'IBM Plex Mono', monospace;
		border-radius: 0.2em;
		transition:
			background-color 130ms ease,
			color 130ms ease,
			font-weight 130ms ease;
	}

	.zoomout {
		background-color: var(--bw-red);
	}

	.zoomout:hover {
		background-color: var(--bw-surface1);
		color: var(--bw-red);
	}

	.zoomin {
		background-color: var(--bw-green);
	}

	.zoomin:hover {
		background-color: var(--bw-surface1);
		color: var(--bw-green);
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
