import { toServerUrl } from "../../utils/index.js";
import * as common from "../index.js";
import { schemaMeta } from "./meta.js";
import { SchemaNode } from "./node.js";
import { selectNodeIdUrl, selectNodeInstanceEntries, selectNodeRefUrl } from "./selectors.js";

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

        await this.loadInstanceReferences(
            instanceUrl,
            instanceNode,
        );
    }

    private async loadInstanceReferences(
        nodeUrl: URL,
        node: SchemaNode,
    ) {
        const referencingInstanceUrl = toServerUrl(nodeUrl);

        const idNodeUrl = selectNodeIdUrl(node);
        const refNodeUrl = selectNodeRefUrl(nodeUrl, node);

        if (idNodeUrl != null) {
            this.commonSchemaLoader.loadFromNode(
                node,
                idNodeUrl,
                referencingInstanceUrl,
                schemaMeta.metaSchemaUrl,
            );
        }

        if (refNodeUrl != null) {
            const referenceInstanceUrl = toServerUrl(refNodeUrl);
            await this.commonSchemaLoader.loadFromURL(
                referenceInstanceUrl,
                referencingInstanceUrl,
                schemaMeta.metaSchemaUrl,
            );
        }

        for (const [subNodeUrl, subNode] of selectNodeInstanceEntries(nodeUrl, node)) {
            await this.loadInstanceReferences(
                subNodeUrl,
                subNode,
            );
        }
    }

}
