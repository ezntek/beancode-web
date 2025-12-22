
interface IEditorState {
    curFileName: string,
    curFilePath: string,
    saved: boolean,
    src: string,
}
export const es: IEditorState = $state({
    curFileName: "",
    curFilePath: "",
    saved: true,
    src: "",
});
