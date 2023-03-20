import * as common from "../index.js";
import { SchemaNode } from "./node.js";

export class SchemaLoader extends common.SchemaLoaderBase {
    public async loadFromRootNode(
        node: SchemaNode,
        nodeUrl: URL,
        referencingNodeUrl: URL | null,
    ): Promise<void> {
        throw new Error("not implemented");
    }

}
