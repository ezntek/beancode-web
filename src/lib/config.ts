export interface IConfig {
    preferredDarkTheme: string,
    preferredLightTheme: string,
    editorFont: string,
    terminalFont: string,
    editorFontSize: number,
    terminalFontSize: number,
    fileBrowserShown: boolean,
    terminalShown: boolean,
    reduceFlair: boolean,
};

export function getDefaultConfig(): IConfig {
    let esz = 20;
    let tsz = 22;

    return {
        preferredDarkTheme: "default_dark",
        preferredLightTheme: "default_light",
        editorFont: 'IBM Plex Mono',
        terminalFont: 'IBM Plex Mono',
        editorFontSize: esz,
        terminalFontSize: tsz,
        fileBrowserShown: true,
        terminalShown: true,
        reduceFlair: false,
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
        typeof obj.terminalFontSize === 'number' &&
        typeof obj.fileBrowserShown === 'boolean' &&
        typeof obj.terminalShown === 'boolean' && 
        typeof obj.reduceFlair === 'boolean' 
    );
}

export function saveConfig(cfg: IConfig) {
    if (window)
        window.localStorage.setItem("Config", JSON.stringify(cfg));
} 
