import { pointerToHash } from "../../utils/index.js";
import { SchemaIndexerBase } from "../indexer.js";
import { SchemaManager } from "../manager.js";
import { SchemaLoader } from "./loader.js";
import { metaSchema } from "./meta.js";
import { SchemaNode } from "./node.js";
import { selectNodeAnchor, selectNodeInstanceEntries, selectNodeRecursiveAnchor } from "./selectors.js";

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
    private readonly recursiveAnchorMap = new Map<string, string>();

    public getAnchorNodeId(nodeId: string) {
        return this.anchorMap.get(nodeId);
    }

    public getRecursiveAnchorNodeId(nodeId: string) {
        const nodeKey = String(nodeId);
        return this.recursiveAnchorMap.get(nodeKey);
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

    public resolveRecursiveReferenceNodeId(nodeId: string, nodeRecursiveRef: string) {
        const nodeItem = this.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

        const nodeRootId = String(nodeItem.nodeRootUrl);
        const nodeRetrievalUrl = this.manager.getNodeRetrievalUrl(nodeRootId);

        const nodeRefRetrievalUrl = new URL(nodeRecursiveRef, nodeRetrievalUrl);
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
            const maybeResolvedNodeId = this.getRecursiveAnchorNodeId(
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

        const nodeRecursiveAnchor = selectNodeRecursiveAnchor(node);
        if (nodeRecursiveAnchor ?? false) {
            const recursiveAnchorUrl = nodeUrl;
            const recursiveAnchorId = String(recursiveAnchorUrl);
            if (this.recursiveAnchorMap.has(recursiveAnchorId)) {
                throw new Error("duplicate recursiveAnchorId");
            }
            this.recursiveAnchorMap.set(recursiveAnchorId, nodeId);
        }

        super.indexNode(
            node,
            nodeRootUrl,
            nodePointer,
        );
    }

}
