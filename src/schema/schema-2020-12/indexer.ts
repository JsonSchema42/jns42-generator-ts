import { pointerToHash } from "../../utils/index.js";
import { SchemaIndexerBase } from "../indexer.js";
import { SchemaManager } from "../manager.js";
import { SchemaLoader } from "./loader.js";
import { metaSchema } from "./meta.js";
import { SchemaNode } from "./node.js";
import { selectNodeAnchor, selectNodeDynamicAnchor, selectNodeInstanceEntries } from "./selectors.js";

export interface SchemaIndexerNodeItem {
    node: SchemaNode;
    nodeRootUrl: URL;
    nodePointer: string;
    nodeParentUrl: URL | null;
}

export class SchemaIndexer extends SchemaIndexerBase {
    private readonly nodeMap = new Map<string, SchemaIndexerNodeItem>();
    private readonly anchorMap = new Map<string, string>();
    private readonly dynamicAnchorMap = new Map<string, string>();

    constructor(
        manager: SchemaManager,
        private readonly loader: SchemaLoader,
    ) {
        super(manager);
    }

    public getNodeItem(nodeId: string) {
        return this.nodeMap.get(nodeId);
    }

    public getAnchorNodeId(nodeId: string) {
        return this.anchorMap.get(nodeId);
    }

    public getDynamicAnchorNodeId(nodeId: string) {
        return this.dynamicAnchorMap.get(nodeId);
    }

    public isNodeAncestor(childNodeId: string, nodeAncestorUrl: URL): boolean {
        const item = this.nodeMap.get(childNodeId);
        if (!item) {
            throw new Error("node item not found");
        }

        if (item.nodeParentUrl == null) {
            return false;
        }

        const nodeParentId = String(item.nodeParentUrl);
        const nodeAncestorId = String(nodeAncestorUrl);
        if (nodeParentId === nodeAncestorId) {
            return true;
        }

        return this.isNodeAncestor(childNodeId, item.nodeParentUrl);
    }

    public getAllNodeIds() {
        return this.nodeMap.keys();
    }

    public resolveReferenceNodeId(nodeId: string, nodeRef: string) {
        const nodeItem = this.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

        const nodeRootId = String(nodeItem.nodeRootUrl);
        const nodeRetrievalUrl = this.manager.getNodeRetrievalUrl(nodeRootId);

        const nodeRefRetrievalUrl = new URL(nodeRef, nodeRetrievalUrl);
        const nodeRefRetrievalId = String(nodeRefRetrievalUrl);
        const nodeRefRootUrl = this.manager.getNodeRootUrl(nodeRefRetrievalId);

        const resolvedNodeUrl = new URL(nodeRefRetrievalUrl.hash, nodeRefRootUrl);
        let resolvedNodeId = String(resolvedNodeUrl);

        const anchorNodeId = this.getAnchorNodeId(resolvedNodeId);

        if (anchorNodeId != null) {
            resolvedNodeId = anchorNodeId;
        }

        return resolvedNodeId;

    }

    public resolveDynamicReferenceNodeId(nodeId: string, nodeDynamicRef: string) {
        const nodeItem = this.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

        const nodeRootId = String(nodeItem.nodeRootUrl);
        const nodeRetrievalUrl = this.manager.getNodeRetrievalUrl(nodeRootId);

        const nodeRefRetrievalUrl = new URL(nodeDynamicRef, nodeRetrievalUrl);
        const nodeRefRetrievalId = String(nodeRefRetrievalUrl);
        const nodeRefRootUrl = this.manager.getNodeRootUrl(nodeRefRetrievalId);

        const resolvedNodeUrl = new URL(nodeRefRetrievalUrl.hash, nodeRefRootUrl);
        let resolvedNodeId = String(resolvedNodeUrl);

        let currentRootNodeUrl: URL | null = new URL("", resolvedNodeUrl);
        while (currentRootNodeUrl != null) {
            const currentRootNodeId = String(currentRootNodeUrl);
            const currentRootNode = this.loader.getRootNodeItem(currentRootNodeId);
            if (currentRootNode == null) {
                throw new Error("rootNode not found");
            }

            const currentNodeUrl = new URL(
                resolvedNodeUrl.hash,
                currentRootNode.nodeUrl,
            );
            const currentNodeId = String(currentNodeUrl);
            const maybeResolvedNodeId = this.getDynamicAnchorNodeId(
                currentNodeId,
            );
            if (maybeResolvedNodeId != null) {
                resolvedNodeId = maybeResolvedNodeId;
            }

            currentRootNodeUrl = currentRootNode.referencingNodeUrl;
        }

        return resolvedNodeId;
    }

    public indexNodes() {
        for (const item of this.loader.getRootNodeItems()) {
            this.indexNode(
                item.node,
                item.nodeUrl,
                "",
                null,
            );
        }
    }

    private indexNode(
        node: SchemaNode,
        nodeBaseUrl: URL,
        nodePointer: string,
        nodeParentUrl: URL | null,
    ) {
        const nodeUrl = new URL(pointerToHash(nodePointer), nodeBaseUrl);
        const nodeId = String(nodeUrl);

        const item: SchemaIndexerNodeItem = {
            node,
            nodeRootUrl: nodeBaseUrl,
            nodePointer,
            nodeParentUrl,
        };
        if (this.nodeMap.has(nodeId)) {
            throw new Error("duplicate nodeId");
        }
        this.nodeMap.set(nodeId, item);
        this.manager.registerNodeMetaSchema(nodeId, metaSchema.metaSchemaId);

        const nodeAnchor = selectNodeAnchor(node);
        if (nodeAnchor != null) {
            const anchorUrl = new URL(`#${nodeAnchor}`, nodeBaseUrl);
            const anchorId = String(anchorUrl);
            if (this.anchorMap.has(anchorId)) {
                throw new Error("duplicate anchorId");
            }
            this.anchorMap.set(anchorId, nodeId);
        }

        const nodeDynamicAnchor = selectNodeDynamicAnchor(node);
        if (nodeDynamicAnchor != null) {
            const dynamicAnchorUrl = new URL(`#${nodeDynamicAnchor}`, nodeBaseUrl);
            const dynamicAnchorId = String(dynamicAnchorUrl);
            if (this.dynamicAnchorMap.has(dynamicAnchorId)) {
                throw new Error("duplicate dynamicAnchorId");
            }
            this.dynamicAnchorMap.set(dynamicAnchorId, nodeId);
        }

        for (const [subNodePointer, subNode] of selectNodeInstanceEntries(nodePointer, node)) {
            this.indexNode(
                subNode,
                nodeBaseUrl,
                subNodePointer,
                nodeUrl,
            );
        }
    }

}
