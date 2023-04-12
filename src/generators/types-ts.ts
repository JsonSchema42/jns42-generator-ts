import ts from "typescript";
import { SchemaManager } from "../schema/manager.js";

export function* getTypesTsStatements(
    factory: ts.NodeFactory,
    manager: SchemaManager,
) {
    yield* manager.generateTypeStatements(factory);

}
