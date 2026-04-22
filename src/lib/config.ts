export interface IConfig {
    preferredDarkTheme: string,
    preferredLightTheme: string,
    editorFont: string,
    terminalFont: string,
    editorFontSize: number,
    terminalFontSize: number,
};

export function getDefaultConfig(): IConfig {
    return {
        preferredDarkTheme: "catppuccin_macchiato",
        preferredLightTheme: "catppuccin_latte",
        editorFont: 'IBM Plex Mono',
        terminalFont: 'IBM Plex Mono',
        editorFontSize: 20,
        terminalFontSize: 20,
    };
}

export function isValidConfig(obj: any): obj is IConfig {
    // TODO: do some proper validation
    return (
        Boolean(obj) &&
        typeof obj === 'object' &&
        typeof obj.preferredDarkTheme === 'string' &&
        typeof obj.preferredLightTheme === 'string' &&
        typeof obj.editorFont === 'string' &&
        typeof obj.terminalFont === 'string' &&
        typeof obj.editorFontSize === 'number' &&
        typeof obj.terminalFontSize === 'number'
    );
}
