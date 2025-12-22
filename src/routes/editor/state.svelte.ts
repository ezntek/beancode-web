import { FileResponseKind, type FileResponse, type Dir } from '$lib/fstypes';

const INPUT_MAX = 1024;
export const inputBuf = new SharedArrayBuffer(INPUT_MAX + 4);
export const interruptBuf = new SharedArrayBuffer(1);

interface IState {
    status: string,
    themeName: string,
    exitCode: number,
    versionText: string,
    cwd: string,
    curdir: Dir,
    running: boolean,
    curFileStatus: FileResponseKind,
};

export const s: IState = $state({
    status: "",
    themeName: "catppuccin_macchiato",
    versionText: "loading beancode",
    exitCode: 0,
    cwd: "/",
    curdir: new Map(), 
    running: false,
    curFileStatus: FileResponseKind.Ok,
});

// AFTER finished reading files
export type FileResponseCallback = (msgKind: string, path: string, response: FileResponse) => void;
export let fileResponseCallback: FileResponseCallback | null = null;
export function setFileResponseCallback(cb: FileResponseCallback) {
    fileResponseCallback = cb;
}
