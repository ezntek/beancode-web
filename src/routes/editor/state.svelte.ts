const INPUT_MAX = 1024;
export const inputBuf = new SharedArrayBuffer(INPUT_MAX + 4);
export const interruptBuf = new SharedArrayBuffer(1);
export const s = $state({ log: String(), editorSrc: String() });
