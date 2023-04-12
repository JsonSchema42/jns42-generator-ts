import ts from "typescript";
import { SchemaManager } from "../schema/manager.js";

export function* getValidatorsTsStatements(
    factory: ts.NodeFactory,
    manager: SchemaManager,
) {
    yield* manager.generateValidatorStatements(factory);
}
