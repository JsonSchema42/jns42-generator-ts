import ts from "typescript";
import { SchemaManager } from "../schema/index.js";
import { Namer } from "../utils/index.js";

export abstract class CodeGeneratorBase {
    constructor(
        protected readonly factory: ts.NodeFactory,
        protected readonly namer: Namer,
        protected readonly manager: SchemaManager,
    ) {

    }

}
