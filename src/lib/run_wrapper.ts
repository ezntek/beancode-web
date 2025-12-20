export interface VarTable {
    file_name: string,
    src: string,
    exit_code: string,
}

export function gen_beancode_wrapper(vars: VarTable): string {
    return `
from beancode.lexer import Lexer;from beancode.parser import Parser;from beancode.interpreter import Interpreter;from beancode.error import * 
try:
\ti = Interpreter(Parser(Lexer(${vars.src}).tokenize()).program().stmts);i.toplevel = True;i.visit_block(None);${vars.exit_code} = 0
except BCError as err:
\terr.print(${vars.file_name}, ${vars.src})
except SystemExit as e:
\t${vars.exit_code} = e.code
except KeyboardInterrupt:
\twarn("Caught keyboard interrupt")
\t${vars.exit_code} = 1 
except EOFError:
\twarn("Caught EOF")
\t${vars.exit_code} = 1 
except RecursionError as e:
\twarn("Python recursion depth exceeded! Did you forget your base case?")
\t${vars.exit_code} = 1 
except Exception as e:
\terror(f'Python exception caught ({type(e)}: "{e}")! Please report this to the developers.');raise e
`
}

export function gen_py_wrapper(vars: VarTable): string {
    let processed = vars.src.split("\n").join("\n\t") + `\n\t${vars.exit_code} = 0`;
    return `
try:
\t${processed}
except SystemExit as e:
\t${vars.exit_code} = e.code
except Exception as e:
\traise e
`
}
