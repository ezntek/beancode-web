/*
 * Beancode Web
 * 
 * Copyright (c) 2026-present Eason Qin <eason@ezntek.com>
 * 
 * This source code form is licensed under the GNU Affero General Public
 * License version 3 (or later). If you cannot locate the LICENSE.md file at
 * the root of the project, visit <http://www.gnu.org/licenses/> for more
 * information.
 */

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

function makeCatppuccinTheme(flavor: CatppuccinFlavor): ThemeSpec {
    const C = flavor.colors;
    return {
        base1: C.crust.hex,
        base2: C.mantle.hex,
        base3: C.base.hex,
        surface1: C.surface0.hex,
        surface2: C.surface1.hex,
        surface3: C.surface2.hex,
        overlay1: C.overlay0.hex,
        overlay2: C.overlay1.hex,
        overlay3: C.overlay2.hex,
        subtext1: C.subtext0.hex,
        subtext2: C.subtext1.hex,
        text: C.text.hex,
        red: C.red.hex,
        green: C.green.hex,
        yellow: C.yellow.hex,
        blue: C.blue.hex,
        magenta: C.mauve.hex,
        cyan: C.teal.hex,
        brightRed: C.red.hex,
        brightGreen: C.green.hex,
        brightYellow: C.yellow.hex,
        brightBlue: C.blue.hex,
        brightMagenta: C.mauve.hex,
        brightCyan: C.teal.hex,
        orange: C.peach.hex,
        purple: C.lavender.hex,
    };
}

const defaultDark = {
    base1: "#1b1f24",
    base2: "#21252b",
    base3: "#272b32",
    surface1: "#2e343b",
    surface2: "#40474f",
    surface3: "#4b5263",
    overlay1: "#4b5263",
    overlay2: "#5c6370",
    overlay3: "#636d83",
    subtext1: "#828997",
    subtext2: "#9da5b4",
    text: "#abb2bf",
    red: "#e06c75",
    green: "#98c379",
    yellow: "#e5c07b",
    blue: "#61afef",
    magenta: "#c678dd",
    cyan: "#56b6c2",
    brightRed: "#e06c75",
    brightGreen: "#98c379",
    brightYellow: "#e5c07b",
    brightBlue: "#61afef",
    brightMagenta: "#c678dd",
    brightCyan: "#56b6c2",
    orange: "#d19a66",
    purple: "#be5046",
};

const defaultLight = {
    // Backgrounds
    base1:         "#eaebef",      // panels/sidebar — darken(bg, ~4%)
    base2:         "#f1f1f5",      // in-between
    base3:         "#f8f8fb",      // main editor bg — hsl(230, 1%, 98%)
    surface1:      "#e2e2ef",      // selection background
    surface2:      "#d9d9e6",      // cursor line / active line highlight
    surface3:      "#d9d9e6",      // same as surface2
    overlay1:      "#c8c8d4",      // indent guides / borders
    overlay2:      "#b0b0be",      // slightly stronger borders
    overlay3:      "#b0b0be",      // same as overlay2
    subtext1:      "#8e8f95",      // mono-3 — hsl(230, 4%, 64%) — gutter/comments
    subtext2:      "#5f626c",      // mono-2 — hsl(230, 6%, 44%)
    text:          "#383a42",      // mono-1 — hsl(230, 8%, 24%) — main fg
    red:           "#e45649",
    green:         "#50a14f",
    yellow:        "#e2ac23",
    blue:          "#4078f2",
    magenta:       "#a626a4",
    cyan:          "#0184bc",
    brightRed:     "#e45649",
    brightGreen:   "#50a14f",
    brightYellow:  "#e2ac23",
    brightBlue:    "#4078f2",
    brightMagenta: "#a626a4",
    brightCyan:    "#0184bc",
    orange:        "#e18906",
    purple:        "#ab29b0",
};

import { createCodemirrorTheme } from '$lib/highlighting/catppuccin'
import { flavors, type CatppuccinFlavor } from '@catppuccin/palette'
import { type Extension } from "@codemirror/state";

export const THEMES = {
    'catppuccin_latte': makeCatppuccinTheme(flavors.latte),
    'catppuccin_frappe': makeCatppuccinTheme(flavors.frappe),
    'catppuccin_macchiato': makeCatppuccinTheme(flavors.macchiato),
    'catppuccin_mocha': makeCatppuccinTheme(flavors.mocha),
    'default_dark': defaultDark,
    'default_light': defaultLight,
}

export const catppuccinLatte: Extension = createCodemirrorTheme(
    THEMES['catppuccin_latte'], false);
export const catppuccinFrappe: Extension = createCodemirrorTheme(
    THEMES['catppuccin_frappe'], true);
export const catppuccinMacchiato: Extension = createCodemirrorTheme(
    THEMES['catppuccin_macchiato'], true);
export const catppuccinMocha: Extension = createCodemirrorTheme(
    THEMES['catppuccin_mocha'], true);
export const defaultDarkCodemirror: Extension = createCodemirrorTheme(defaultDark, true);
export const defaultLightCodemirror: Extension = createCodemirrorTheme(defaultLight, true);

export const CM_THEMES = {
    'catppuccin_latte': catppuccinLatte,
    'catppuccin_frappe': catppuccinFrappe,
    'catppuccin_macchiato': catppuccinMacchiato,
    'catppuccin_mocha': catppuccinMocha,
    'default_dark': defaultDarkCodemirror,
    'default_light': defaultLightCodemirror,
}

export const THEME_NAMES = {
    'catppuccin_latte': 'Catppuccin Latte',
    'catppuccin_frappe': 'Catppuccin Frappe',
    'catppuccin_macchiato': 'Catppuccin Macchiato',
    'catppuccin_mocha': 'Catppuccin Mocha',
    'default_dark': 'Default Dark',
    'default_light': 'Default Light',
};

export function applyTheme(themeName: string, loadedTheme: boolean) { 
    if (!(themeName in THEMES))
        console.error(`could not find theme ${themeName}!`);

    // @ts-ignore
    for (let [prop, color] of Object.entries(THEMES[themeName] as ThemeSpec)) {
        let v = "--bw-" + String(prop);
        document.documentElement.style.setProperty(v, color);
    }

    if (loadedTheme) window.localStorage.setItem('EditorTheme', themeName);
}
