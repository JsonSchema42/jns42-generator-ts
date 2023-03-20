import ts from "typescript";
import { SchemaManager } from "./manager.js";

export abstract class SchemaCodeGeneratorBase {
    constructor(
        protected readonly manager: SchemaManager,
    ) {
    }

    public abstract generateStatements(
        factory: ts.NodeFactory,
        nodeId: string
    ): Iterable<ts.Statement>

}

