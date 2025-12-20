import { type Dir } from '$lib/fstypes';

const INPUT_MAX = 1024;
export const inputBuf = new SharedArrayBuffer(INPUT_MAX + 4);
export const interruptBuf = new SharedArrayBuffer(1);

interface IState {
    status: string,
    editorSrc: string,
    themeName: string,
    exitCode: number,
    versionText: string,
    cwd: string,
    curdir: Dir,
};

export const s: IState = $state({
    status: "",
    editorSrc: "",
    themeName: "catppuccin_macchiato",
    versionText: "loading beancode",
    exitCode: 0,
    cwd: "/lib",
    curdir: new Map(), 
});

// AFTER finished reading files
export type ReadFileCallback = (path: string, contents: string) => void;
export let readFileCallback: ReadFileCallback | null = null;
export function setReadFileCallback(cb: ReadFileCallback) {
    readFileCallback = cb;
}
