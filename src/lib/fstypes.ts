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
