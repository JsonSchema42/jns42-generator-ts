import ts from "typescript";
import { SchemaManager } from "../schema/manager.js";
import { Namer } from "../utils/index.js";

export function* getSpecFileContent(
    factory: ts.NodeFactory,
    namer: Namer,
    manager: SchemaManager,
    nodeUrl: URL,
) {
    yield* manager.generateSpecStatements(factory, namer, nodeUrl);
}
