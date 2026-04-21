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

import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { type ThemeSpec } from "$lib/themes/themes";

export function createCodemirrorTheme(ts: ThemeSpec, isDark: boolean = false) {
  const theme = EditorView.theme(
    {
      "&": {
        color: ts.text,
        backgroundColor: ts.base3,
      },

      ".cm-content": {
        caretColor: ts.subtext2,
      },

      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: ts.subtext2,
      },

      "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        {
          backgroundColor: ts.blue+"80",
        },

      ".cm-panels": {
        backgroundColor: ts.base2,
        color: ts.text,
      },
      ".cm-panels.cm-panels-top": { borderBottom: "2px solid black" },
      ".cm-panels.cm-panels-bottom": { borderTop: "2px solid black" },

      ".cm-searchMatch": {
        backgroundColor: `${ts.blue}59`,
        outline: `1px solid ${ts.blue}`,
      },
      ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: `${ts.blue}2f`,
      },

      ".cm-activeLine": { backgroundColor: ts.surface1+"af" },
      ".cm-selectionMatch": {
        backgroundColor: `${ts.surface3}4d`,
      },

      "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
        backgroundColor: `${ts.surface3}47`,
        color: ts.text,
      },

      ".cm-gutters": {
        backgroundColor: ts.base3,
        color: ts.subtext1,
        border: "none",
      },

      ".cm-activeLineGutter": {
        backgroundColor: ts.surface1,
      },

      ".cm-foldPlaceholder": {
        backgroundColor: "transparent",
        border: "none",
        color: ts.overlay1,
      },

      ".cm-tooltip": {
        border: "none",
        backgroundColor: ts.surface1,
      },
      ".cm-tooltip .cm-tooltip-arrow:before": {
        borderTopColor: "transparent",
        borderBottomColor: "transparent",
      },
      ".cm-tooltip .cm-tooltip-arrow:after": {
        borderTopColor: ts.surface1,
        borderBottomColor: ts.surface1,
      },
      ".cm-tooltip-autocomplete": {
        "& > ul > li[aria-selected]": {
          backgroundColor: ts.surface2,
          color: ts.text,
        },
      },
    },
    { dark: isDark }
  );

 const highlightStyle = HighlightStyle.define([
    { tag: t.keyword, color: ts.magenta },
    {
      tag: [
        t.name,
        t.definition(t.name),
        t.deleted,
        t.character,
        t.macroName,
      ],
      color: ts.text,
    },
    {
      tag: [
        t.function(t.variableName),
        t.function(t.propertyName),
        t.propertyName,
        t.labelName,
      ],
      color: ts.blue,
    },
    {
      tag: [t.color, t.constant(t.name), t.standard(t.name)],
      color: ts.orange,
    },
    { tag: [t.self, t.atom], color: ts.red },
    {
      tag: [t.typeName, t.className, t.changed, t.annotation, t.namespace],
      color: ts.yellow,
    },
    { tag: [t.operator], color: ts.blue },
    { tag: [t.url, t.link], color: ts.cyan },
    { tag: [t.escape, t.regexp], color: ts.magenta },
    {
      tag: [t.meta, t.punctuation, t.separator, t.comment],
      color: ts.overlay3,
    },
    { tag: t.strong, fontWeight: "bold" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: t.link, color: ts.blue, textDecoration: "underline" },
    { tag: t.heading, fontWeight: "bold", color: ts.blue },
    {
      tag: [t.special(t.variableName)],
      color: ts.purple,
    },
    { tag: [t.bool, t.number], color: ts.orange },
    {
      tag: [t.processingInstruction, t.string, t.inserted],
      color: ts.green,
    },
    { tag: t.invalid, color: ts.red },
  ]);

  return [theme, syntaxHighlighting(highlightStyle)];
}

// Create extensions for all variants
