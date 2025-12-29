import { LanguageSupport, LRLanguage } from "@codemirror/language";
import { parser } from "./parser";
import { styleTags, tags as t } from "@lezer/highlight";

const myLanguageHighlighting = styleTags({
    // comments
    LineComment: t.lineComment,
    BlockComment: t.blockComment,
    
    // keywords
    KIf: t.controlKeyword,
    KThen: t.controlKeyword,
    KElse: t.controlKeyword,
    KEndif: t.controlKeyword,
    KCase: t.controlKeyword,
    KOtherwise: t.controlKeyword,
    KEndcase: t.controlKeyword,
    KWhile: t.controlKeyword,
    KDo: t.controlKeyword,
    KEndwhile: t.controlKeyword,
    KRepeat: t.controlKeyword,
    KUntil: t.controlKeyword,
    KFor: t.controlKeyword,
    KTo: t.controlKeyword,
    KStep: t.controlKeyword,
    KNext: t.controlKeyword,
    // just normal keywords
    KOutput: t.keyword,
    KPrint: t.keyword,
    KInput: t.keyword,
    KCall: t.keyword,
    KReturn: t.keyword,
    KReturns: t.keyword,
    KScope: t.keyword,
    KEndscope: t.keyword,
    KInclude: t.moduleKeyword,
    KTrace: t.keyword,
    KEndtrace: t.keyword,
    KOpenfile: t.keyword,
    KWritefile: t.keyword,
    KReadfile: t.keyword,
    KClosefile: t.keyword,
    KRead: t.keyword,
    KWrite: t.keyword,
    KAppend: t.keyword,
    KExport: t.keyword,
    // definitions 
    KDeclare: t.definitionKeyword,
    KConstant: t.definitionKeyword,
    KProcedure: t.definitionKeyword,
    KFunction: t.definitionKeyword,
    KEndprocedure: t.definitionKeyword,
    KEndfunction: t.definitionKeyword,
    // types
    KArray: t.keyword,
    KOf: t.keyword,
    KInteger: t.typeName,
    KBoolean: t.typeName,
    KReal: t.typeName,
    KString: t.typeName,
    KChar: t.typeName,
    
    // operators
    KOr: t.keyword,
    KAnd: t.keyword,
    KNot: t.keyword,
    Add: t.arithmeticOperator,
    Sub: t.arithmeticOperator,
    Mul: t.arithmeticOperator,
    Div: t.arithmeticOperator,
    Pow: t.arithmeticOperator,
    Eq: t.compareOperator,
    Neq: t.compareOperator,
    Gt: t.compareOperator,
    Lt: t.compareOperator,
    Geq: t.compareOperator,
    Leq: t.compareOperator,
    Assign: t.definitionOperator,
    
    // Literals
    IntegerLit: t.integer,
    RealLit: t.float,
    StringLit: t.string,
    CharLit: t.character,
    BooleanLit: t.bool,
    KTrue: t.bool,
    KFalse: t.bool,
    KNull: t.null,

    // separators
    Comma: t.separator,
    Colon: t.punctuation,
    LParen: t.paren,
    RParen: t.paren,
    LBracket: t.squareBracket,
    RBracket: t.squareBracket,
    LCurly: t.brace,
    RCurly: t.brace,
    
    Type: t.typeName,
    PrimitiveType: t.typeName,
    ArrayType: t.typeName,

    // Identifiers
    Ident: t.variableName,
    FileIdent: t.variableName,
    // Individual library routines get the same tag
    LUcase: t.number,
    LLcase: t.number,
    LDiv: t.number,
    LMod: t.number,
    LSubstring: t.number,
    LRound: t.number,
    LSqrt: t.number,
    LLength: t.number,
    LGetchar: t.number,
    LRandom: t.number,
    LPutchar: t.number,
    LExit: t.number,
    LSleep: t.number,
    LFlush: t.number,
    LSin: t.number,
    LCos: t.number,
    LTan: t.number,
    LInitarray: t.number,

    "FunctionStatement/Ident!": t.function(t.definition(t.variableName)),
    "ProcedureStatement/Ident!": t.function(t.definition(t.variableName)),

    "FunctionCall/TIdent!": t.function(t.variableName),
    "CallStatement/TIdent!": t.function(t.variableName),
    
    // Library routines standalone
    LibroutineIdent: t.number,
    
    // Identifiers
});

export const beancodeLanguage = LRLanguage.define({
    parser: parser.configure({
        props: [myLanguageHighlighting]
    }),
    languageData: {
        commentTokens: {
            line: "//",
            block: { open: "/*", close: "*/" },
        },
        indentUnit: "    ",
    }
});

export function beancode() {
    // @ts-ignore
    return new LanguageSupport(beancodeLanguage, []);
}
