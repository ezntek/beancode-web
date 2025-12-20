const INPUT_MAX = 1024;
export const inputBuf = new SharedArrayBuffer(INPUT_MAX + 4);
export const interruptBuf = new SharedArrayBuffer(1);

interface IState {
    status: string,
    editorSrc: string,
    themeName: string,
    exitCode: number,
    versionText: string,
};

export const s: IState = $state({
    status: "",
    editorSrc: "",
    themeName: "catppuccin_macchiato",
    versionText: "loading beancode",
    exitCode: 0,
});
