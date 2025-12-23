// boolean: isDir 
export type Dir = Map<string, boolean>

export enum FileResponseKind {
    Ok = 0,
    NotFound,
    IsDir,
    NotText,
    AlreadyExists,
    Errno,
    Exception,
}

export function displayFileResponseKind(k: FileResponseKind): string {
    switch (k) {
        case FileResponseKind.Ok:
            return "Successful"
        case FileResponseKind.NotFound:
            return "File not found (no such file or directory)"
        case FileResponseKind.IsDir:
            return "Is a folder, not a file (is a directory)"
        case FileResponseKind.NotText:
            return "File does not contain text, and cannot be opened"
        case FileResponseKind.AlreadyExists:
            return "File already exists"
        case FileResponseKind.Errno:
            return "Error code"
        case FileResponseKind.Exception:
            return "Exception"
    }
}

export type FileResponse = 
    | { kind: FileResponseKind.Ok, data: string }
    | { kind: FileResponseKind.NotFound }
    | { kind: FileResponseKind.IsDir }
    | { kind: FileResponseKind.NotText }
    | { kind: FileResponseKind.AlreadyExists }
    | { kind: FileResponseKind.Errno, errno: number, msg: string }
    | { kind: FileResponseKind.Exception, data: any }

export function displayFileResponse(r: FileResponse): string {
    let base = displayFileResponseKind(r.kind);
    switch (r.kind) {
        case FileResponseKind.Ok:
        case FileResponseKind.NotFound:
        case FileResponseKind.IsDir:
        case FileResponseKind.NotText:
        case FileResponseKind.AlreadyExists:
            break;
        case FileResponseKind.Errno:
            base += `: ${r.msg}`;
            break;
        case FileResponseKind.Exception:
            base += `: ${String(r.data)}`
            break;
    }
    return base;
}

export function pathJoin(...parts: string[]): string {
    let newParts = [];

    for (const part of parts.flatMap(p => p.split('/'))) {
        if (part === '..') {
            newParts.pop();
        } else if (part !== '' && part != '.') {
            newParts.push(part);
        }
    }

    return '/' + newParts.join('/');
}

export function pathBasename(path: string): string {
    const parts = path.split('/');
    return parts[parts.length - 1];
}

export function pathExtension(path: string): string {
    const parts = pathBasename(path).split('.');
    return parts.length !== 1 ? parts[parts.length - 1] : '';
}

export function pathBeginsWith(path: string, subpath: string): boolean {
    return pathJoin(path).startsWith(pathJoin(subpath))
}

export function pathCountParts(path: string): number {
    let p = path.trim();
    if (p[0] === '/')
        p = p.slice(1);
    return p.split('/').length;
}

const ERRNO_MESSAGES: { [errno: number]: string } = {
    1: "Operation not permitted",
    2: "No such file or directory",
    3: "No such process",
    4: "Interrupted system call",
    5: "Input/output error",
    6: "No such device or address",
    7: "Argument list too long",
    8: "Exec format error",
    9: "Bad file descriptor",
    10: "No child processes",
    11: "Resource temporarily unavailable",
    12: "Cannot allocate memory",
    13: "Permission denied",
    14: "Bad address",
    16: "Device or resource busy",
    17: "File exists",
    18: "Invalid cross-device link",
    19: "No such device",
    20: "Not a directory",
    21: "Is a directory",
    22: "Invalid argument",
    23: "Too many open files in system",
    24: "Too many open files",
    25: "Inappropriate ioctl for device",
    27: "File too large",
    28: "No space left on device",
    29: "Illegal seek",
    30: "Read-only file system",
    31: "Too many links",
    32: "Broken pipe",
    33: "Numerical argument out of domain",
    34: "Numerical result out of range",
};

export function strerror(errno: number): string {
    return ERRNO_MESSAGES[errno] ?? `Unknown error ${errno}`;
}

