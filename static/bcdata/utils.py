# Beancode Web
#
# Copyright (c) 2026-present Eason Qin <eason@ezntek.com>
#
# This Source Code Form is subject to the terms of the Mozilla Public
# license, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#

# type: ignore

from beancode.lexer import Lexer
from beancode.parser import Parser
from beancode.interpreter import Interpreter
from beancode.error import *
from beancode.formatter import Formatter
from beancode.tracer import *
from beancode.runner import *
from beancode.repl import Repl
from beancode import __version__
import ast, sys, shutil

__py_version__ = sys.version.split(" ")[0]


def exec_user_py(src, name):
    def my_exit():
        raise SystemExit()

    user_globals = {"__name__": "__main__", "__file__": name, "exit": my_exit, "__builtins__": __builtins__}
    user_locals = user_globals

    try:
        code = compile(src, filename=name, mode="exec")
        exec(code, user_globals, user_locals)
        return 0
    except SystemExit as e:
        return e.code
    except KeyboardInterrupt:
        return 1
    except Exception as e:
        import traceback
        tb = e.__traceback__
        tb = tb.tb_next
        traceback.print_exception(type(e), e, tb)
        return 1
    # propagate other errors


def exec_user_bean(src, name, tracer=None):
    errdict = None
    try:
        i = Interpreter(Parser(Lexer(src).tokenize()).program().stmts, tracer=tracer)
        i.toplevel = True
        i.visit_block(None)
        c = 0
    except BCError as err:
        err.print(name, src, compact=True)
        errdict = err.to_dict(src)
        c = 1
    except SystemExit as e:
        c = e.code
    except KeyboardInterrupt:
        # exit button should not produce an error message
        c = 1
    except EOFError:
        warn("Caught EOF")
        c = 1
    except RecursionError as e:
        warn("Recursion depth exceeded! Did you forget your base case?")
        c = 1
    except Exception as e:
        error(
            f'Python exception caught ({type(e)}: "{e}") while running beancode! Please report this to the developers.'
        )
        raise e
    return (c, errdict)


def format_bean(src, name):
    lexer = Lexer(src, preserve_comments=True)
    try:
        toks = lexer.tokenize()
        parser = Parser(toks, preserve_trivia=True)
        blk = parser.program().stmts
        f = Formatter(blk)
        res = "".join(f.visit_block())
        return (res, None)
    except BCError as err:
        err.print(name, src, compact=True)
        return (None, err.to_dict())


def trace_bean(s, n, v, cfg):
    cfg_py = cfg.to_py()
    tc = TracerConfig()
    for key, val in cfg_py.items():
        if hasattr(tc, key):
            setattr(tc, key, val)
    t = Tracer(v.to_py(), tc)
    (_, edic) = exec_user_bean(s, n, tracer=t)
    if edic is not None:
        return (None, edic)
    else:
        return (t.gen_html(), None)

def nuke(d):
    for itm in os.listdir(d):
        if itm not in {'..', '.'}:
            print(f"removing: {itm}")
            os.remove(itm)

def format_py(src, name):
    try: 
        s = ast.unparse(ast.parse(src, filename=name))
        return s
    except SyntaxError as e:
        print(f"\x1b[1m{e.filename}: \x1b[31merror\x1b[0m at line {e.lineno} column {e.offset}:")
        print(e.msg)
        begin = f" \x1b[31;1m{e.lineno}\x1b[0m | "
        padding = len(str(e.lineno)) + 4 # space, space, |, space
        print(f"{begin}{e.text.rstrip() if e.text else ''}")
        if e.offset:
            spaces = '' * padding
            print(f"{spaces}\x1b[33m{' ' * (e.offset - 1 + padding)}^{'~' * (e.end_offset - e.offset - 1)}\x1b[0m")
