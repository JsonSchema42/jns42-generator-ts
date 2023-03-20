import ts from "typescript";
import { SchemaManager } from "./manager.js";

export abstract class SchemaValidatorGeneratorBase {
    constructor(
        protected readonly manager: SchemaManager,
    ) {
    }

    public abstract generateFunctionDeclarationStatement(
        factory: ts.NodeFactory,
        nodeId: string
    ): ts.Statement

}

