# beancode web

Beancode web aims to be a portable, simple and friendly web IDE for IGCSE Computer Science (0478, 2210) Pseudocode and Python, designed for students and teachers who may not be very comfortable nor experienced with traditional text editors/IDEs. It intends to be simple, intuitive, and do one thing only, edit code well.

## Visit it!

Go [https://beancode-web.pages.dev/editor](here)

## The Interpreter Backend

The interpreter is written in Python (yes... I know), and you can find it [https://github.com/ezntek/beancode](here), it is called beancode.

## Credits

Despite my tireless work on the web IDE (sacrificing my entire winter break), I still used libraries that I did not make, and I'd like to thank these people for writing awesome software that this project could not have existed without:

- [https://codemirror.net](CodeMirror) for the code editor component (text selection, copy paste, indentation)
- [https://lezer.codemirror.net](The Lezer Parser System) as the syntax highlighting backend
- [https://xtermjs.org](Xterm.js) for the terminal
- [https://pyodide.org](Pyodide) in order to run CPython in WebAssembly, and the [https://github.com/ezntek/beancode](beancode) interpreter

## Development

`bun run dev`
