import ts from "typescript";
import { Node } from "../schema/intermediate.js";

export abstract class CodeGeneratorBase {
    constructor(
        protected readonly factory: ts.NodeFactory,
        protected readonly names: Record<string, string[]>,
        protected readonly nodes: Record<string, Node>
    ) {}
}
