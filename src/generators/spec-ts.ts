import ts from "typescript";
import { SchemaManager } from "../schema/manager.js";

export function* getSpecFileContent(
    factory: ts.NodeFactory,
    manager: SchemaManager,
    nodeUrl: URL,
) {
    yield* manager.generateSpecStatements(factory, nodeUrl);
}
