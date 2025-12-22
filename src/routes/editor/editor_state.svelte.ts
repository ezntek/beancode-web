
interface IEditorState {
    curFileName: string,
    curFilePath: string,
    saved: boolean,
    editorSrc: string,
}
export const es: IEditorState = $state({
    curFileName: "",
    curFilePath: "",
    saved: false,
    editorSrc: "",
});
