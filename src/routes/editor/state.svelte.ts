/*
 * Beancode Web
 * 
 * Copyright (c) 2026-present Eason Qin <eason@ezntek.com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * license, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { type FileResponse, type Dir } from '$lib/fstypes';
import { post } from '$lib/workers/pyodide_state.svelte';
import { es } from './editor_state.svelte';

export const INPUT_MAX = 2048;
export const inputBuf = undefined;

interface IState {
    status: string,
    themeName: string,
    exitCode: number,
    versionText: string,
    pyVersion: string,
    cwd: string,
    curdir: Dir,
    running: boolean,
    inputBuf: SharedArrayBuffer | null,
    interruptBuf: SharedArrayBuffer | null,
};

export const s: IState = $state({
    status: "",
    themeName: "catppuccin_macchiato",
    versionText: "",
    pyVersion: "",
    exitCode: 0,
    cwd: "/data/projects/default",
    curdir: new Map(), 
    running: false,
    inputBuf: null,
    interruptBuf: null,
});

export function saveFile(overwrite: boolean, path?: string) {
    if (path)
        es.curFilePath = path;
    post({
        kind: 'newfile',
        path: path ?? es.curFilePath,
        contents: es.src,
        overwrite: overwrite
    });
}

export type DoneFormattingCallback = (data: string, path: string) => void;
export type DoneTracingCallback = (data: string) => void;
export type FileResponseCallback = (msgKind: string, path: string, response?: FileResponse<any>) => void;
export type DownloadCallback = (name: string) => void;
export type DownloadCwdCallback = (blob?: Blob) => void;

export let doneFormattingCallback: DoneFormattingCallback | null = null;
export let doneTracingCallback: DoneTracingCallback | null = null;
export let fileResponseCallback: FileResponseCallback | null = null;
export let downloadCallback : DownloadCallback | null = null;
export let downloadCwdCallback: DownloadCwdCallback | null = null;

export function setDoneFormattingCallback(cb: DoneFormattingCallback) {
    doneFormattingCallback = cb;
}

export function setDoneTracingCallback(cb: DoneTracingCallback) {
    doneTracingCallback = cb;
}

export function setFileResponseCallback(cb: FileResponseCallback) {
    fileResponseCallback = cb;
}

export function setDownloadCallback(cb: DownloadCallback) {
    downloadCallback = cb;
}

export function setDownloadCwdCallback(cb: DownloadCwdCallback) {
    downloadCwdCallback = cb;
}
