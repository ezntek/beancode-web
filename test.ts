import {getTraceableVars} from './src/lib/tracer';

getTraceableVars(`
DECLARE A, B: INTEGER
CONSTANT Name <- "Eason" + Qin
FOR Counter <- 1 TO 5
    X <- 69
NEXT Counter
`);
