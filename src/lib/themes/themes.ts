/*
 * Beancode Web
 * 
 * Copyright (c) 2026-present Eason Qin <eason@ezntek.com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * license, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
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
        brightMagenta: C.teal.hex,
        brightCyan: C.mauve.hex,
        orange: C.peach.hex,
        purple: C.lavender.hex,
    };
}

import { flavors, type CatppuccinFlavor } from '@catppuccin/palette'

export const THEMES = {
    'catppuccin_latte': makeCatppuccinTheme(flavors.latte),
    'catppuccin_macchiato': makeCatppuccinTheme(flavors.macchiato),
}

export function applyTheme(themeName: string) { 
    if (!(themeName in THEMES))
        console.error(`could not find theme ${themeName}!`);

    // @ts-ignore
    for (let [prop, color] of Object.entries(THEMES[themeName] as ThemeSpec)) {
        let v = "--bw-" + String(prop);
        document.documentElement.style.setProperty(v, color);
    }
}
