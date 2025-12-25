import { parser } from "./parser";

let code = `X <- 4`;
code = "DECLARE X: INTEGER"
//code = "1+2*3-4"

const tree = parser.parse(code);
console.log(tree.toString());
