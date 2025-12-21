// boolean: isDir 
export type Dir = Map<string, boolean>

export enum FileResponseKind {
    Ok = 0,
    NotFound = 1,
    IsDir = 2,
    NotText = 3,
    Errno = 4,
    Exception = 5
}

export type FileResponse = 
    | { kind: FileResponseKind.Ok, data: string }
    | { kind: FileResponseKind.NotFound }
    | { kind: FileResponseKind.IsDir }
    | { kind: FileResponseKind.NotText }
    | { kind: FileResponseKind.Errno, errno: number, msg: string }
    | { kind: FileResponseKind.Exception, data: any }

export function pathJoin(...parts: string[]): string {
    let newParts = [];

    for (const part of parts.flatMap(p => p.split('/'))) {
        if (part === '..' && newParts.length != 0) {
            newParts.pop();
        } else if (part !== '' && part != '.') {
            newParts.push(part);
        }
    }

    return '/' + newParts.join('/');
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

