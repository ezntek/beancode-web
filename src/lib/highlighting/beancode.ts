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
    KInteger: t.keyword,
    KBoolean: t.keyword,
    KReal: t.keyword,
    KString: t.keyword,
    KChar: t.keyword,
    
    // operators
    KOr: t.logicOperator,
    KAnd: t.logicOperator,
    KNot: t.logicOperator,
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
    
    // Identifiers
    Ident: t.variableName,
    FileIdent: t.variableName,
    
    // separators
    Comma: t.separator,
    Colon: t.punctuation,
    LParen: t.paren,
    RParen: t.paren,
    LBracket: t.squareBracket,
    RBracket: t.squareBracket,
    LCurly: t.brace,
    RCurly: t.brace,
    
    // Higher-level constructs (usually don't need styling, but can be useful)
    Type: t.typeName,
    PrimitiveType: t.typeName,
    ArrayType: t.typeName,
    
    // Function/procedure names in their definition context
    "FunctionStatement/Ident": t.function(t.definition(t.variableName)),
    "ProcedureStatement/Ident": t.function(t.definition(t.variableName)),
    
    // Function calls
    "FunctionCall/Ident": t.function(t.variableName),
    "CallStatement/Ident": t.function(t.variableName),
});
export const beancodeLanguage = LRLanguage.define({
    parser: parser.configure({
        props: [myLanguageHighlighting]
    }),
    languageData: {
        commentTokens: {
            line: "//",
            block: { open: "/*", close: "*/" },
        }
    }
});
export function beancode() {
    // @ts-ignore
    return new LanguageSupport(beancodeLanguage, []);
}
