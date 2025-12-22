
interface IEditorState {
    curFilePath: string,
    saved: boolean,
    src: string,
}
export const es: IEditorState = $state({
    curFilePath: "",
    saved: true,
    src: "",
});
