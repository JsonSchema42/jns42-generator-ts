import ts from "typescript";
import { SchemaManager } from "./manager.js";

export abstract class SchemaTypeGeneratorBase {
    constructor(
        protected readonly manager: SchemaManager,
    ) {
    }

    public abstract generateTypeDeclarationStatement(
        factory: ts.NodeFactory,
        nodeId: string
    ): ts.Statement

}

