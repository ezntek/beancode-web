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
