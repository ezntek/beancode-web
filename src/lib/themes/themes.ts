export interface ThemeSpec {
    base1: string,
    base2: string,
    base3: string,
    surface1: string,
    surface2: string,
    surface3: string,
    overlay1: string,
    overlay2: string,
    overlay3: string,
    subtext1: string,
    subtext2: string,
    text: string,
	red: string
	green: string
	yellow: string
	blue: string
	magenta: string
	cyan: string
	brightRed: string
	brightGreen: string
	brightYellow: string
	brightBlue: string
	brightMagenta: string
	brightCyan: string
	orange: string
	purple: string
}

import { CATPPUCCIN_MACCHIATO } from './catppuccin_macchiato';
import { CATPPUCCIN_LATTE } from './catppuccin_latte';
import { DEFAULT_DARK } from './default_dark';
import { DEFAULT_LIGHT } from './default_light';

export const THEMES = {
    'catppuccin_latte': CATPPUCCIN_LATTE,
    'catppuccin_macchiato': CATPPUCCIN_MACCHIATO,
    'default_dark': DEFAULT_DARK,
    'default_light': DEFAULT_LIGHT,
}

export function applyTheme(theme: ThemeSpec) { 
    for (let [prop, color] of Object.entries(theme)) {
        let v = "--bw-" + String(prop);
        document.documentElement.style.setProperty(v, color);
    }
}
