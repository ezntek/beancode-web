/*
 * Beancode Web
 * 
 * Copyright (c) 2026-present Eason Qin <eason@ezntek.com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * license, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { FileResponseKind, pathBasename, pathJoin, strerror, type Dir } from "$lib/fstypes";
import type { PyMessage, EditorMessage, BeanError } from "./pyodide_state.svelte";
import type { FileResponse } from "$lib/fstypes";
import { tracerConfigToPython, type TracerConfig } from "$lib/tracer";
import JSZip from "jszip";

function post(msg: PyMessage) {
    postMessage(msg satisfies PyMessage);
}

class XtermWriter {
    isatty: boolean

    constructor() {
        this.isatty = true;
    }
    
    write(buf: Uint8Array) {
        let text = new TextDecoder("utf-8").decode(buf)
        text = text.replaceAll("\n", "\r\n");
        post({ kind: 'pyout', data: text });
        return buf.length;
    }
}

let inputBuf: SharedArrayBuffer;
let interruptBuf: SharedArrayBuffer;
let FS: any;

class XtermStdinHandler {
    isatty: boolean

    constructor() {
        this.isatty = true;
    }

    stdin = (): string => {
        post({ kind: 'pyin' });
        const flag = new Int32Array(inputBuf, 0, 1);
        const buf = new Uint8Array(inputBuf, 4); 
        Atomics.wait(flag, 0, 0);
        if (flag[0] == 0) {
            // KeyboardInterrupt
            flag.fill(0);
            buf.fill(0);
            return "";
        }
        const sliced = buf.slice(0, flag[0]);
        const res = new TextDecoder('utf-8').decode(sliced);
        Atomics.store(flag, 0, 0);
        buf.fill(0);
        return res;
    }
}

function sync() {
    FS.syncfs(false, () => {});
}

function listDir(path: string): Dir {
    let dir: Dir = new Map(); 
    const listing = FS.readdir(path);
    for (const item of listing) {
        const itemPath = pathJoin(path, item);
        const stat = FS.stat(itemPath);
        dir.set(item, FS.isDir(stat.mode));
    }
    cwd = pathJoin(path);
    py.globals.set("newcwd", cwd);
    py.runPython("os.chdir(newcwd);del newcwd");
    return dir;
}

function fileResponseFromException(exc: any): FileResponse<any> {
    if (typeof exc.errno !== 'number') {
        return { kind: FileResponseKind.Exception, data: exc };
    }

    if (exc.errno === 2 || exc.errno === 44) {
        console.error(`Caught exception: `, exc);
        return { kind: FileResponseKind.NotFound };
    } else if (exc.errno === 21) {
        return { kind: FileResponseKind.IsDir };
    } else {
        return { kind: FileResponseKind.Errno, errno: exc.errno, msg: strerror(exc.errno) };
    }
}

function readFile(path: string): FileResponse<string> {
    let data: Uint8Array;
    let decoded: string;

    try {
        data = FS.readFile(path);
    } catch (exc: any) {
        return fileResponseFromException(exc);
    }

    const decoder = new TextDecoder('utf-8', { fatal: true });

    try {
        decoded = decoder.decode(data);
    } catch (exc: any) {
        return { kind: FileResponseKind.NotText };
    }

    return { kind: FileResponseKind.Ok, data: decoded };
}

function newFile(path: string, contents: string, overwrite: boolean): FileResponse<null> {
    if (FS.analyzePath(path).exists && !overwrite) {
        return { kind: FileResponseKind.AlreadyExists };
    }

    let stream: any;
    try {
        stream = FS.writeFile(path, contents);
    } catch (exc: any) {
        return fileResponseFromException(exc);
    }

    sync();
    return { kind: FileResponseKind.Ok, data: null };
}

function newDir(path: string, overwrite: boolean) : FileResponse<null> {
    if (FS.analyzePath(path).exists && !overwrite) {
        return { kind: FileResponseKind.AlreadyExists };
    }

    try {
        FS.mkdir(path);
    } catch (exc: any) {
        return fileResponseFromException(exc);
    }

    return { kind: FileResponseKind.Ok, data: null };
}

function delPath(path: string) {
    if (!FS.analyzePath(path).exists)
        return;

    try {
        if (FS.isDir(path)) {
            // we have python anyway :shrug:
            py.globals.set('dir', path);
            py.runPython(`shutil.rmtree(d);del(dir)`);    
        } else {
            FS.unlink(path);
            sync();
        }
    } catch (e) {
        console.log(String(e));
        return fileResponseFromException(e);
    }
}

function renamePath(oldpath: string, newpath: string): FileResponse<string> {
    try {
        FS.rename(oldpath, newpath);
    } catch (e) {
        return fileResponseFromException(e);    
    } 

    sync();
    return { kind: FileResponseKind.Ok, data: newpath };
}

async function compressDir(path: string): Promise<FileResponse<Blob>> {
    const zip = new JSZip();

    if (!FS.analyzePath(path).exists)
        return {kind: FileResponseKind.NotFound};

    const decoder = new TextDecoder('utf-8', { fatal: true });
    let data: Uint8Array;
    try {
        const listing = FS.readdir(path);
        for (const item of listing) {
            if (item == '.' || item == '..')
                continue;

            const itemPath = pathJoin(path, item);
            if (FS.isDir(itemPath))
                continue;

            console.log("item path: ", itemPath);
            data = FS.readFile(itemPath);
            try {
                zip.file(item, decoder.decode(data));
            } catch (e) {
                zip.file(item, data);
            }
        }
    } catch (e) {
        return fileResponseFromException(e);
    }

    const res = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
    });
    return { kind: FileResponseKind.Ok, data: res};
}

async function doInitialSetupCheck() {
    if (!FS.analyzePath("/data/projects").exists)
        FS.mkdirTree("/data/projects");

    // TODO: remove
    if (!FS.analyzePath("/data/projects/default").exists)
        FS.mkdirTree("/data/projects/default");

    const res = await fetch("/bcdata/utils.py?url");
    if (!res.ok) {
        throw new Error(`could not fetch beancode utilities: ${res.status}`);
    }
    const UTIL_SCRIPT = await res.text();

    py.runPython(UTIL_SCRIPT);
}

let py: any;
async function loadBeancode() {
    if (!py) {
        // @ts-ignore
        const PyodideModule = await import("https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.mjs?url");
        //const PyodideModule = await import("/pyodide/pyodide.mjs?url");
        // @ts-ignore
        py = await PyodideModule.loadPyodide({});
        FS = py.FS;

        FS.mkdirTree("/data");
        FS.mount(FS.filesystems.IDBFS, {}, "/data");
        await FS.syncfs(true, () => {});

        await py.loadPackage("micropip");

        const BEANCODE_VERSION = "0.7.0b3";
        const PATH = `/bcdata/beancode-${BEANCODE_VERSION}-py3-none-any.whl`
        const SCRIPT = `import micropip,os;await micropip.install(\"${PATH}\")`
        try {
            await py.runPythonAsync(SCRIPT)
        } catch (e) {
            post({ kind: 'error', data: String(e) });
            pyOK = false; 
            return;
        }

        await doInitialSetupCheck();

        py.setStdout(new XtermWriter());
        py.setStderr(new XtermWriter());
        py.setStdin(new XtermStdinHandler());

        const version = py.globals.get("__version__")
        const pyversion = py.globals.get("__py_version__")
        post({ kind: 'ready', version: version, pyversion: pyversion });
        post({ kind: 'output', data: 'Ready' });
        post({ kind: 'status', data: 'Ready', positive: true });
    }
    pyOK = true;
}

let pyOK = false;
let pyBeancodePromise = loadBeancode();
let cwd = "/data/projects";

function handleBeanErr(vname: string) {
    const edicProxy = py.globals.get(vname);
    if (edicProxy) {
        let proxies: any[] = [];
        const edic = edicProxy.toJs({proxies});
        post({ kind: 'beanerror', data: { ...edic } satisfies BeanError});
        for (let px of proxies) {
            px.destroy();
        }
        edicProxy.destroy();
    }
}

async function handleRun(src: string, path: string) {
    try {
        post({ kind: 'status', data: 'Running Beancode', positive: true});
        py.globals.set("n", pathBasename(path) || "(beanweb)");
        py.globals.set("s", src);
        py.globals.set("c", 0);
        py.runPython("(c,edic)=exec_user_bean(s,n)");
        const exit_code = py.globals.get("c");
        handleBeanErr("edic");
        post({ kind: 'pyexit', code: exit_code });
        setTimeout(() => {
            post({ kind: 'status', data: 'Ready', positive: true });
        }, 500);
        //py.runPython("del(s,n,c,edic)");
    } catch (e: any) {
        post({ kind: 'error', data: String(e) });
        setTimeout(() => {
            post({ kind: 'status', data: 'An error occurred', positive: false });
        }, 500);
        post({ kind: 'pyexit', code: 1 });
    }
}

async function handleRunPy(src: string, name: string){
    try {
        post({ kind: 'status', data: 'Running Python', positive: true});
        py.globals.set("s", src);
        py.globals.set("n", name);
        py.runPython("c=exec_user_py(s,n)");
        const exit_code = py.globals.get("c");
        //py.runPython("del(s,n,c)");
        post({ kind: 'pyexit', code: exit_code });
    } catch (e: any) {
        post({ kind: 'error', data: String(e) });
        post({ kind: 'pyexit', code: 1 });
    }
}

function formatBean(src: string, path: string): string | null {
    try {
        py.globals.set("s", src);
        py.globals.set("n", pathBasename(path));
        py.runPython("(r,edic)=format_bean(s,n)");
        handleBeanErr("edic");
        const res = py.globals.get("r");
        //py.runPython("del(s,n,r,edic)");
        // @ts-ignore
        return res;
    } catch (e: any) {
        post({ kind: 'error', data: String(e) });
    }
    return null;
}

function trace(src: string, path: string, vars: string[], config: TracerConfig): string | null {
    py.globals.set("s", src);
    py.globals.set("n", pathBasename(path));
    py.globals.set("v", vars);
    py.globals.set("cfg", tracerConfigToPython(config));
    py.runPython("(res,edic)=trace_bean(s,n,v)");
    handleBeanErr("edic");
    const out = py.globals.get("res");
    //py.runPython("del(s,n,v,cfg,edic,res)"); 
    return out;
}

onmessage = async (event: MessageEvent<EditorMessage>) => { 
    try {
        await pyBeancodePromise;

        if (!pyOK)
            return;
    
        const msg = event.data;
        switch (msg.kind) {
            case 'run':
                (new Uint8Array(interruptBuf))[0] = 0;
                post({ kind: 'clear' });
                await handleRun(msg.data, msg.path);
                break;
            case 'runpy':
                (new Uint8Array(interruptBuf))[0] = 0;
                post({ kind: 'clear' });
                await handleRunPy(msg.data, msg.path);
                break;
            case 'setup':
                inputBuf = msg.inputBuf;
                interruptBuf = msg.interruptBuf;
                py.setInterruptBuffer(new Uint8Array(interruptBuf));
                break;
            case 'listdir':
                post({ kind: 'listdir-response', data: listDir(msg.path) });
                break;
            case 'readfile':
                post({ kind: 'readfile-response', path: msg.path, data: readFile(msg.path) });
                break;
            case 'newfile':
                post({ kind: 'newfile-response', path: msg.path, data: newFile(msg.path, msg.contents, msg.overwrite) });
                break;
            case 'newdir':
                post({ kind: 'newdir-response', path: msg.path, data: newDir(msg.path, msg.overwrite) });
                break;
            case 'delfile':
                delPath(msg.path);
                post({ kind: 'delfile-response', path: msg.path});
                break;
            case 'renamefile':
                post({ kind: 'renamefile-response', path: msg.oldpath, data: renamePath(msg.oldpath, msg.newpath) });
                break;
            case 'format':
                post({ kind: 'format-response', data: formatBean(msg.data, msg.path), path: msg.path });
                break;
            case 'trace':
                post({ kind: 'trace-response', data: trace(msg.data, msg.path, msg.vars, msg.config) });
                break;
            case 'compressdir':
                post({ kind: 'compressdir-response', path: msg.path, data: await compressDir(msg.path) });
                break;
        }
    } catch (exc: any) {
        console.error("worker error: ", exc);
        let data = String(exc);
        if (exc.name === "ErrnoError") {
            data = `Errno ${exc.errno}`;
        }

        post({ kind: 'error', data: data });
    }
}

export {};
