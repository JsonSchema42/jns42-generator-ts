import ts from "typescript";
import { SchemaManager } from "../schema/manager.js";
import { Namer } from "../utils/index.js";

export function* getValidatorsTsStatements(
    factory: ts.NodeFactory,
    namer: Namer,
    manager: SchemaManager,
) {
    yield* manager.generateValidatorStatements(factory, namer);
}
