## WARNING

this is the development branch. code here may not necessarily work as intended. clone from `main` instead! That's what the website is based off of.

# beancode web

Beancode web aims to be a portable, simple and friendly web IDE for IGCSE Computer Science (0478, 2210) Pseudocode and Python, designed for students and teachers who may not be very comfortable nor experienced with traditional text editors/IDEs. It intends to be simple, intuitive, and do one thing only, edit code well.

## Visit it!

Go [here](https://beancode-web.pages.dev/editor)

## The Interpreter Backend

The interpreter is written in Python (yes... I know), and you can find it [here](https://github.com/ezntek/beancode), it is called beancode.

## Credits

Despite my tireless work on the web IDE (sacrificing my entire winter break), I still used libraries that I did not make, and I'd like to thank these people for writing awesome software that this project could not have existed without:

- [CodeMirror](https://codemirror.net) for the code editor component (text selection, copy paste, indentation)
- [The Lezer Parser System](https://lezer.codemirror.net) as the syntax highlighting backend
- [Xterm.js](https://xtermjs.org) for the terminal
- [Pyodide](https://pyodide.org) in order to run CPython in WebAssembly, and the [beancode](https://github.com/ezntek/beancode) interpreter

## Development

*NOTE: Always `npm install` or `bun install`* first.

### Dev Server:

Bun: `bun run dev`
npm: `npm run dev`

### Preview

(make sure you have https enabled in `vite.config.ts` first)

Bun: `bun run build; bun run preview`
npm: `npm run build; npm run preview`

### Generate Lezer Parser

Bun: `bunx lezer-generator beancode.grammar -o src/lib/highlighting/parser.js`
npm: `npx lezer-generator beancode.grammar -o src/lib/highlighting/parser.js`
