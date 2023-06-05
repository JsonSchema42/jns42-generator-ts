import ts from "typescript";
import { Node } from "../schema/intermediate.js";
import { Namer } from "../utils/index.js";

export abstract class CodeGeneratorBase {
    constructor(
        protected readonly factory: ts.NodeFactory,
        protected readonly namer: Namer,
        protected readonly nodes: Record<string, Node>,
    ) {

    }

}
