import { tick } from "svelte";
import { Compartment } from '@codemirror/state';
import { history } from '@codemirror/commands';
import type { EditorView } from "codemirror";
import { pathExtension } from "$lib/fstypes";

interface IEditorState {
    curFilePath: string,
    saved: boolean,
    src: string,
    canDisplay: boolean,
    view: EditorView | null,
    history: Compartment,
    fileHistories: Map<string, string>,
}

export const es: IEditorState = $state({
    curFilePath: "",
    saved: true,
    src: "",
    canDisplay: true,
    view: null, 
    history: new Compartment(),
    fileHistories: new Map(),
});

export function editorNewFile() {
    tick().then(() => {
        es.src = '';
        es.curFilePath = '';
        es.saved = true;
    });
}

export function changeFile(newSrc: string, newPath: string) {
    // clear history
    es.curFilePath = newPath;
    es.view!.dispatch({
        changes: {
            from: 0,
            to: es.view!.state.doc.length,
            insert: newSrc
        }
    });
    tick().then(() => {
        es.view!.dispatch({ effects: es.history.reconfigure([]) }); 
        es.view!.dispatch({ effects: es.history.reconfigure(history())});
        es.saved = true;
    });
}

export function curExtension() { return pathExtension(es.curFilePath) };
