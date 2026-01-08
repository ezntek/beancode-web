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

import { parser } from "./highlighting/parser";

export interface TracerConfig {
    traceEveryLine: boolean,
    hideRepeatingEntries: boolean,
    condenseArrays: boolean,
    syntaxHighlighting: boolean,
    showOutputs: boolean,
    promptOnInputs: boolean,
}

export function defaultTracerConfig(): TracerConfig {
    return {
        traceEveryLine: false, hideRepeatingEntries: true, condenseArrays: false,
        syntaxHighlighting: true, showOutputs: false, promptOnInputs: true
    };
}

export function tracerConfigToPython(c: TracerConfig): Object {
    return {
        trace_every_line: c.traceEveryLine,
        hide_repeating_entries: c.hideRepeatingEntries,
        condense_arrays: c.condenseArrays,
        syntax_highlighting: c.syntaxHighlighting,
        show_outputs: c.showOutputs,
        prompt_on_inputs: c.promptOnInputs,
        debug: false,
        i_will_not_cheat: false,
    }
}

export function getTraceableVars(src: string): string[] {
    const tree = parser.parse(src);
    const vars: Set<string> = new Set();
    const cursor = tree.cursor();

    do {
        const nodeName = cursor.name;
        let node: typeof cursor.node;
        switch (nodeName) {
            case 'DeclareStatement':
                node = cursor.node;
                for (let child = node.firstChild; child; child = child.nextSibling) {
                    if (child.name === "Colon") break;
                    if (child.name === "Ident")
                        vars.add(src.slice(child.from, child.to));
                }
            case 'ConstantStatement':
            case 'ForStatement':
            case 'AssignStatement':
                node = cursor.node;
                for (let child = node.firstChild; child; child = child.nextSibling) {
                    if (child.name === "Assign") break; // break before the rhs
                    if (child.name === "Ident")
                        vars.add(src.slice(child.from, child.to)); 
                }
            default:
                break;
        }
    } while (cursor.next());

    return Array.from(vars);
}
