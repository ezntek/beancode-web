import { CompletionContext, type Completion } from "@codemirror/autocomplete";

const EXT_TEXT = "Unofficial beancode-specific extension feature"

function keywords(): Completion[] {
    const KEYWORDS = [
        "DECLARE", "CONSTANT", "OUTPUT", "INPUT", "AND", "OR", "NOT", "IF",
        "THEN", "ELSE", "ENDIF", "CASE", "OF", "OTHERWISE", "ENDCASE",
        "WHILE", "DO", "ENDWHILE", "REPEAT", "UNTIL", "FOR", "TO", "STEP",
        "NEXT", "PROCEDURE", "ENDPROCEDURE", "CALL", "FUNCTION", "RETURNS",
        "RETURN", "ENDFUNCTION", "OPENFILE", "READFILE", "WRITEFILE",
        "CLOSEFILE", "READ", "WRITE",
    ];
    const KEYWORDS_EXT = [ 
        "APPEND", "TRACE", "ENDTRACE", "SCOPE", "ENDSCOPE", "INCLUDE",
        "EXPORT", "PRINT",
    ];
    return [
        KEYWORDS.map((itm) => ({ label: itm, type: "keyword" })),
        KEYWORDS_EXT.map((itm) => ({ label: itm, type: "keyword", info: EXT_TEXT }))
    ].flat();
}

function types(): Completion[] {
    const TYPES = [
        "INTEGER", "REAL", "STRING", "BOOLEAN", "CHAR", "ARRAY"
    ];
    const res: Completion[] = TYPES.map((itm) => ({ label: itm, type: "type" }));
    res.push({ label: "NULL", type: "type", info: EXT_TEXT });
    return res;
}

function libroutines(): Completion[] {
    const LIBROUTINES = [
        "UCASE", "LCASE", "DIV", "MOD", "SUBSTRING", "ROUND", "LENGTH",
        "RANDOM",
    ];
    const LIBROUTINES_EXT = [
        "SQRT", "GETCHAR", "PUTCHAR", "EXIT", "SLEEP", "FLUSH", "SIN",
        "COS", "TAN", "FORMAT", "INITARRAY"
    ];
    return [
        LIBROUTINES.map((itm) => ({ label: itm, type: "function" })),
        LIBROUTINES_EXT.map((itm) => ({ label: itm, type: "function", info: EXT_TEXT })),
    ].flat();
}

export function beancodeCompletions(context: CompletionContext) {
    let word = context.matchBefore(/\w*/);

    if (!word)
        return null;

    if (word.from == word.to && !context.explicit)
        return null;

    return {
        from: word.from,
        options: [
            ...keywords(),
            ...types(),
            ...libroutines(),
        ],
    }
}
