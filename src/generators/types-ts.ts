import ts from "typescript";
import { SchemaManager } from "../schema/manager.js";
import { Namer } from "../utils/index.js";

export function* getTypesTsStatements(
    factory: ts.NodeFactory,
    namer: Namer,
    manager: SchemaManager,
) {
    yield* manager.generateTypeStatements(factory, namer);

}
