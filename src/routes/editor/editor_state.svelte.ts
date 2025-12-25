import { tick } from "svelte";
import { Compartment } from '@codemirror/state';
import { history } from '@codemirror/commands';
import type { EditorView } from "codemirror";

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
    es.view!.dispatch({ effects: es.history.reconfigure([]) }); 
    es.curFilePath = newPath;
    es.src = newSrc;
    es.view!.dispatch({ effects: es.history.reconfigure(history())});
    tick().then(() => {
        es.saved = true;
    });
}
