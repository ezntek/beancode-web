import { tick } from "svelte";

interface IEditorState {
    curFilePath: string,
    saved: boolean,
    src: string,
    canDisplay: boolean,
}

export const es: IEditorState = $state({
    curFilePath: "",
    saved: true,
    src: "",
    canDisplay: true,
});

export function editorNewFile() {
    tick().then(() => {
        es.src = '';
        es.curFilePath = '';
        es.saved = true;
    });
}
