export interface IConfig {
    preferredDarkTheme: string,
    preferredLightTheme: string,
};

export function getDefaultConfig(): IConfig {
    return {
        preferredDarkTheme: "catppuccin_macchiato",
        preferredLightTheme: "catppuccin_latte",
    };
}
