<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView, keymap } from '@codemirror/view';
	import { history, insertTab } from '@codemirror/commands';
	import { Compartment, EditorState } from '@codemirror/state';
	import { indentUnit } from '@codemirror/language';
	import { beanDiagnostics, errField, es } from './editor_state.svelte';
	import { pathBasename, pathExtension } from '$lib/fstypes';
	import { catppuccinMacchiato } from '$lib/highlighting/catppuccin';
	import { python } from '@codemirror/lang-python';
	import { beancode } from '$lib/highlighting/beancode';

	// custom extension setup
	import {
		highlightSpecialChars,
		drawSelection,
		highlightActiveLine,
		dropCursor,
		rectangularSelection,
		crosshairCursor,
		lineNumbers,
		highlightActiveLineGutter
	} from '@codemirror/view';
	import {
		defaultHighlightStyle,
		syntaxHighlighting,
		indentOnInput,
		bracketMatching,
		foldGutter,
		foldKeymap
	} from '@codemirror/language';
	import { defaultKeymap, historyKeymap } from '@codemirror/commands';
	import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
	import {
		autocompletion,
		completionKeymap,
		closeBrackets,
		closeBracketsKeymap
	} from '@codemirror/autocomplete';
	import { lintKeymap } from '@codemirror/lint';
	import { ps as ps } from '$lib/workers/pyodide_state.svelte';
	import { setErrEffect } from './editor_state.svelte';

	let editor: HTMLDivElement;
	let sz = $state(16);
	let fontTheme: Compartment;
	let highlighter: Compartment;

	onMount(() => {
		fontTheme = new Compartment();
		highlighter = new Compartment();

		const updateListener = EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				const newValue = update.state.doc.toString();
				if (newValue !== es.src) es.src = newValue;
				es.saved = false;
			}
		});

		sz = 16;
		if (window.innerWidth <= 1366 || window.innerHeight <= 768) {
			sz = 14;
		}

		const style = EditorView.theme({
			'&': { height: '100%' },
			'.cm-scroller': { overflow: 'auto' },
			'.cm-content': { fontFamily: 'IBM Plex Mono' },
			'.cm-gutter': { fontFamily: 'IBM Plex Mono', fontSize: '0.75em' },
			'.cm-gutterElement': { display: 'flex', alignItems: 'center' },
			'.cm-tooltip': { fontFamily: 'IBM Plex Mono', fontSize: '14px' }
		});

		const fontStyle = EditorView.theme({
			'.cm-content': { fontSize: sz + 'pt' }
		});

		function exts() {
			return [
				lineNumbers(),
				highlightActiveLineGutter(),
				highlightSpecialChars(),
				foldGutter(),
				drawSelection(),
				dropCursor(),
				EditorState.allowMultipleSelections.of(true),
				indentOnInput(),
				syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
				bracketMatching(),
				closeBrackets(),
				autocompletion(),
				rectangularSelection(),
				crosshairCursor(),
				highlightActiveLine(),
				highlightSelectionMatches(),
				keymap.of([
					...closeBracketsKeymap,
					...defaultKeymap,
					...searchKeymap,
					...historyKeymap,
					...foldKeymap,
					...completionKeymap,
					...lintKeymap,
					{ key: 'Tab', run: insertTab }
				]),
				indentUnit.of('    ')
			];
		}

		es.history = new Compartment();

		$effect(() => {
			es.view!.dispatch({
				effects: setErrEffect.of(ps.curError)
			});
		});

		const startState = EditorState.create({
			doc: '',
			extensions: [
				...exts(),
				catppuccinMacchiato,
				updateListener,
				style,
				fontTheme.of(fontStyle),
				es.history.of(history()),
				highlighter.of(python()),
				es.diag.of(beanDiagnostics),
				errField
			]
		});

		es.view = new EditorView({
			// @ts-ignore
			parent: editor,
			state: startState
		});

		$effect(() => {
			if (es.view! && es.src !== es.view.state.doc.toString()) {
				es.view!.dispatch({
					changes: {
						from: 0,
						to: es.view!.state.doc.length,
						insert: es.src
					}
				});
			}
		});

		$effect(() => {
			const ext = pathExtension(es.curFilePath);
			switch (ext) {
				case 'bean':
					es.view!.dispatch({ effects: highlighter.reconfigure(beancode()) });
					break;
				case 'py':
					es.view!.dispatch({ effects: highlighter.reconfigure(python()) });
					break;
				default:
					es.view!.dispatch({ effects: highlighter.reconfigure([]) });
					break;
			}
		});

		return () => {
			es.view!.destroy();
		};
	});

	function zoomIn() {
		sz += 1;
		const newTheme = EditorView.theme({
			'.cm-content': { fontSize: `${sz}pt` }
		});
		es.view!.dispatch({ effects: fontTheme.reconfigure(newTheme) });
	}

	function zoomOut() {
		sz -= 1;
		const newTheme = EditorView.theme({
			'.cm-content': { fontSize: `${sz}pt` }
		});
		es.view!.dispatch({ effects: fontTheme.reconfigure(newTheme) });
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
