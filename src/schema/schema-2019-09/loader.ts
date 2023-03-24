import { SchemaLoaderBase } from "../loader.js";
import { metaSchema } from "./meta.js";
import { SchemaNode } from "./node.js";
import { selectNodeId, selectNodeInstanceEntries, selectNodeRef } from "./selectors.js";

export interface SchemaLoaderRootNodeItem {
    node: SchemaNode;
    nodeUrl: URL;
    referencingNodeUrl: URL | null;
}

export class SchemaLoader extends SchemaLoaderBase {
    private readonly rootNodeMap = new Map<string, SchemaLoaderRootNodeItem>();

    public getRootNodeItem(nodeId: string) {
        return this.rootNodeMap.get(nodeId);
    }

    public getRootNodeItems() {
        return this.rootNodeMap.values();
    }

    public async loadFromRootNode(
        node: SchemaNode,
        nodeUrl: URL,
        retrievalUrl: URL,
        referencingNodeUrl: URL | null,
    ) {
        let nodeId = String(nodeUrl);

        const maybeNodeId = selectNodeId(node);
        if (maybeNodeId != null) {
            nodeId = maybeNodeId;
            nodeUrl = new URL(nodeId);
        }

        let item = this.rootNodeMap.get(nodeId);
        if (item != null) {
            return nodeUrl;
        }

        item = {
            node,
            nodeUrl,
            referencingNodeUrl,
        };

        this.rootNodeMap.set(nodeId, item);

        this.manager.registerRootNodeMetaSchema(nodeId, metaSchema.metaSchemaId);

        await this.loadFromSubNodes(
            node,
            nodeUrl,
            retrievalUrl,
            "",
        );

        return nodeUrl;
    }

    private async loadFromSubNodes(
        node: SchemaNode,
        nodeUrl: URL,
        retrievalUrl: URL,
        nodePointer: string,
    ) {
        const nodeRef = selectNodeRef(node);

        if (nodeRef != null) {
            const nodeRefUrl = new URL(nodeRef, nodeUrl);
            const retrievalRefUrl = new URL(nodeRef, retrievalUrl);
            retrievalRefUrl.hash = "";
            await this.manager.loadFromUrl(
                nodeRefUrl,
                retrievalRefUrl,
                nodeUrl,
                metaSchema.metaSchemaId,
            );
        }

        for (const [subNodePointer, subNode] of selectNodeInstanceEntries(nodePointer, node)) {
            await this.loadFromSubNodes(
                subNode,
                nodeUrl,
                retrievalUrl,
                subNodePointer,
            );
        }
    }

}
