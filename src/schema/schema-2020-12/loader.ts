import * as common from "../index.js";
import { metaSchema } from "./meta.js";
import { SchemaNode } from "./node.js";
import { selectNodeId, selectNodeInstanceEntries, selectNodeRef } from "./selectors.js";

export interface SchemaLoaderRootNodeItem {
    node: SchemaNode;
    nodeUrl: URL;
    referencingNodeUrl: URL | null;
}

export class SchemaLoader extends common.SchemaLoaderBase {
    private readonly rootNodeMap = new Map<string, SchemaLoaderRootNodeItem>();

    public async loadFromNode(
        node: SchemaNode,
        nodeUrl: URL,
        referencingNodeUrl: URL | null,
    ): Promise<void> {
        let nodeId = selectNodeId(node);
        if (nodeId != null) {
            nodeUrl = new URL(nodeId);
        }
        nodeId ??= String(nodeUrl);

        const item: SchemaLoaderRootNodeItem = {
            node,
            nodeUrl,
            referencingNodeUrl,
        };

        if (this.rootNodeMap.has(nodeId)) {
            return;
        }

        this.rootNodeMap.set(nodeId, item);

        this.manager.registerRootNodeMetaSchema(nodeId, metaSchema.metaSchemaKey);

        await this.loadInstanceReferences(
            nodeUrl,
            nodeId,
            node,
        );
    }

    private async loadInstanceReferences(
        nodeUrl: URL,
        nodePointer: string,
        node: SchemaNode,
    ) {
        const nodeRef = selectNodeRef(node);

        if (nodeRef != null) {
            const nodeRefUrl = new URL(nodeRef, nodeUrl);
            await this.manager.loadFromURL(
                nodeRefUrl,
                nodeUrl,
                metaSchema.metaSchemaKey,
            );
        }

        for (const [subNodePointer, subNode] of selectNodeInstanceEntries(nodePointer, node)) {
            await this.loadInstanceReferences(
                nodeUrl,
                subNodePointer,
                subNode,
            );
        }
    }

}
