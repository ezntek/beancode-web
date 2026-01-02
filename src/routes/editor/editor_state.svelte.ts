import { tick } from "svelte";
import { Compartment, StateEffect, StateField } from '@codemirror/state';
import { history } from '@codemirror/commands';
import type { EditorView } from "codemirror";
import { pathExtension } from "$lib/fstypes";
import {linter, type Diagnostic} from '@codemirror/lint';
import { pyState as ps, type BeanError } from "$lib/workers/pyodide_state.svelte";

interface IEditorState {
    curFilePath: string,
    saved: boolean,
    src: string,
    canDisplay: boolean,
    view: EditorView | null,
    history: Compartment,
    diag: Compartment,
    fileHistories: Map<string, string>,
}

export const es: IEditorState = $state({
    curFilePath: "",
    saved: true,
    src: "",
    canDisplay: true,
    view: null, 
    history: new Compartment(),
    diag: new Compartment(),
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

export const errField = StateField.define<BeanError | null>({
    create() {
        return null;
    },
    update(value, transaction) {
        for (const e of transaction.effects) {
            if (e.is(setErrEffect)) return e.value;
        }
        return value;
    },
});

export const setErrEffect = StateEffect.define<BeanError | null>();

export const beanDiagnostics = linter((view) => {
    let diagnostics: Diagnostic[] = [];
    const e = view.state.field(errField);
    if (e && e.from && e.to) {
        // XXX: there should be an issue regarding the python UTF-8 indices
        // provided by the Python side and it colliding with the JS UTF-16
        // strings, but we won't care for now.
        diagnostics.push({
            from: e.from,
            to: e.to,
            severity: 'error',
            message: e.msg
        });
    }
    return diagnostics;
}, {
    needsRefresh(update) {
        return update.startState.field(errField) !== update.state.field(errField);
    },        
});


export function curExtension() { return pathExtension(es.curFilePath) };
