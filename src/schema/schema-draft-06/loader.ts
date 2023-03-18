import * as common from "../index.js";
import { SchemaNode } from "./node.js";

export interface SchemaLoaderInstanceItem {
    instanceNode: SchemaNode;
    instanceUrl: URL;
    referencingInstanceUrl: URL | null;
}

export class SchemaLoader extends common.SchemaLoaderBase {
    private readonly instanceItemMap = new Map<string, SchemaLoaderInstanceItem>();

    public async loadFromNode(
        instanceNode: SchemaNode,
        instanceUrl: URL,
        referencingInstanceUrl: URL | null,
    ): Promise<void> {
        const item: SchemaLoaderInstanceItem = {
            instanceNode,
            instanceUrl,
            referencingInstanceUrl,
        };

        const instanceKey = String(instanceUrl);

        this.instanceItemMap.set(instanceKey, item);
    }

}
