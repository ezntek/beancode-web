# type: ignore

from beancode.lexer import Lexer
from beancode.parser import Parser
from beancode.interpreter import Interpreter
from beancode.error import *
from beancode.formatter import Formatter
from beancode.tracer import *


def exec_user_py(src, name):
    user_globals = {"__name__": "__main__", "__file__": name}
    user_locals = user_globals
    try:
        exec(src, user_globals, user_locals)
        return 0
    except SystemExit as e:
        return e.code
    except Exception as e:
        raise e


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


def trace_bean(s, n, v):
    t = Tracer(v.to_py(), TracerConfig.from_dict(cfg.to_py()))
    (c, edic) = exec_user_bean(s, n, tracer=t)
    return (t.gen_html() if c == 0 else None, edic)
