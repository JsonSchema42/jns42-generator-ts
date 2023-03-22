import * as common from "../index.js";

export class SchemaLoader extends common.SchemaLoaderBase {
    public async loadFromRootNode(
        node: unknown,
        nodeUrl: URL,
        retrievalUrl: URL,
        referencingNodeUrl: URL | null,
    ): Promise<void> {
        throw new Error("not implemented");
    }

}
