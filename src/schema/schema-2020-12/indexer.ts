import { pointerToHash } from "../../utils/index.js";
import { SchemaIndexerBase } from "../indexer.js";
import { SchemaManager } from "../manager.js";
import { SchemaLoader } from "./loader.js";
import { metaSchema } from "./meta.js";
import { SchemaNode } from "./node.js";
import { selectNodeAnchor, selectNodeDynamicAnchor, selectNodeInstanceEntries } from "./selectors.js";

export class SchemaIndexer extends SchemaIndexerBase<SchemaNode> {
    protected readonly metaSchemaId = metaSchema.metaSchemaId;

    protected selectRootNodeEntries(): Iterable<[URL, SchemaNode]> {
        return [...this.loader.getRootNodeItems()].
            map(({ nodeUrl, node }) => [nodeUrl, node]);
    }
    protected toNodeUrl(nodePointer: string, nodeRootUrl: URL): URL {
        return new URL(pointerToHash(nodePointer), nodeRootUrl);
    }
    protected selectSubNodeEntries(
        nodePointer: string,
        node: SchemaNode,
    ): Iterable<readonly [string, SchemaNode]> {
        return selectNodeInstanceEntries(nodePointer, node);
    }

    constructor(
        manager: SchemaManager,
        private readonly loader: SchemaLoader,
    ) {
        super(manager);
    }

    private readonly anchorMap = new Map<string, string>();
    private readonly dynamicAnchorMap = new Map<string, string>();

    public getAnchorNodeId(nodeId: string) {
        return this.anchorMap.get(nodeId);
    }

    public getDynamicAnchorNodeId(nodeId: string) {
        return this.dynamicAnchorMap.get(nodeId);
    }

    public resolveReferenceNodeId(nodeId: string, nodeRef: string) {
        const nodeItem = this.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

        const nodeRootId = String(nodeItem.nodeRootUrl);
        const nodeRetrievalUrl = this.manager.getNodeRetrievalUrl(nodeRootId);

        const nodeRefRetrievalUrl = new URL(nodeRef, nodeRetrievalUrl);
        nodeRefRetrievalUrl.hash = "";
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
        nodeRefRetrievalUrl.hash = "";
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

    protected indexNode(
        node: SchemaNode,
        nodeRootUrl: URL,
        nodePointer: string,
    ) {
        const nodeUrl = new URL(pointerToHash(nodePointer), nodeRootUrl);
        const nodeId = String(nodeUrl);

        const nodeAnchor = selectNodeAnchor(node);
        if (nodeAnchor != null) {
            const anchorUrl = new URL(`#${nodeAnchor}`, nodeRootUrl);
            const anchorId = String(anchorUrl);
            if (this.anchorMap.has(anchorId)) {
                throw new Error("duplicate anchorId");
            }
            this.anchorMap.set(anchorId, nodeId);
        }

        const nodeDynamicAnchor = selectNodeDynamicAnchor(node);
        if (nodeDynamicAnchor != null) {
            const dynamicAnchorUrl = new URL(`#${nodeDynamicAnchor}`, nodeRootUrl);
            const dynamicAnchorId = String(dynamicAnchorUrl);
            if (this.dynamicAnchorMap.has(dynamicAnchorId)) {
                throw new Error("duplicate dynamicAnchorId");
            }
            this.dynamicAnchorMap.set(dynamicAnchorId, nodeId);
        }

        super.indexNode(
            node,
            nodeRootUrl,
            nodePointer,
        );
    }

}

