export interface VarTable {
    file_name: string,
    src: string,
    exit_code: string,
}

export function gen_wrapper(vars: VarTable): string {
    return `
from beancode.lexer import Lexer
from beancode.parser import Parser
from beancode.interpreter import Interpreter
from beancode.error import * 

try:
    i = Interpreter(Parser(Lexer(${vars.src}).tokenize()).program().stmts)
    i.toplevel = True
    i.visit_block(None)
except BCError as err:
    err.print(${vars.file_name}, ${vars.src})
except SystemExit as e:
    ${vars.exit_code} = e.code
except KeyboardInterrupt:
    warn("Caught keyboard interrupt")
    ${vars.exit_code} = 1 
except EOFError:
    warn("Caught EOF")
    ${vars.exit_code} = 1 
except RecursionError as e:
    warn("Python recursion depth exceeded! Did you forget your base case?")
    ${vars.exit_code} = 1 
except Exception as e:
    error(
        f'Python exception caught ({type(e)}: "{e}")! Please report this to the developers.'
    )
    raise e
`
}
