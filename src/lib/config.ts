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
