/*
 * Beancode Web
 * 
 * Copyright (c) 2026-present Eason Qin <eason@ezntek.com>
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * license, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { FitAddon, Terminal } from '@battlefieldduck/xterm-svelte';
interface ITermState {
    terminal: Terminal | null,
    termFitAddon: FitAddon | null,
    canInput: boolean,
}
export const termState = $state<ITermState>({
    terminal: null,
    canInput: false,
    termFitAddon: null,
});
