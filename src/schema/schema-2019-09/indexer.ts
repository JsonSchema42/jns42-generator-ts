import { SchemaIndexerBase } from "../indexer.js";
import { SchemaManager } from "../manager.js";
import { MetaSchemaId } from "../meta.js";
import { SchemaLoader } from "./loader.js";
import { metaSchema } from "./meta.js";
import { selectNodeAnchor, selectNodeId, selectNodeInstanceEntries, selectNodeRecursiveAnchor } from "./selectors.js";
import { Schema } from "./types.js";

export class SchemaIndexer extends SchemaIndexerBase<Schema> {
    protected readonly metaSchemaId = metaSchema.metaSchemaId;

    public selectRootNodeEntries(): Iterable<[URL, Schema]> {
        return [...this.loader.getRootNodeItems()].
            map(({ nodeUrl, node }) => [nodeUrl, node]);
    }

    public selectSubNodeEntries(
        nodePointer: string,
        node: Schema,
    ): Iterable<readonly [string, Schema]> {
        return selectNodeInstanceEntries(nodePointer, node);
    }

    protected makeNodeId(
        node: Schema,
        nodeRootUrl: URL,
        nodePointer: string,
    ): string {
        /*
        if a node has an id set, use that!
        */
        const nodeId = selectNodeId(node);
        if (nodeId != null) {
            return nodeId;
        }

        const nodeUrl = new URL(`#${nodePointer}`, nodeRootUrl);
        return String(nodeUrl);
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
        const hash = nodeRefRetrievalUrl.hash;
        nodeRefRetrievalUrl.hash = "";
        const nodeRefRetrievalId = String(nodeRefRetrievalUrl);
        const nodeRefRootUrl = this.manager.getNodeRootUrl(nodeRefRetrievalId);

        const resolvedNodeUrl = new URL(hash, nodeRefRootUrl);
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
        const hash = nodeRefRetrievalUrl.hash;
        nodeRefRetrievalUrl.hash = "";
        const nodeRefRetrievalId = String(nodeRefRetrievalUrl);
        const nodeRefRootUrl = this.manager.getNodeRootUrl(nodeRefRetrievalId);

        const resolvedNodeUrl = new URL(hash, nodeRefRootUrl);
        let resolvedNodeId = String(resolvedNodeUrl);

        let currentRootNodeUrl: URL | null = new URL("", resolvedNodeUrl);
        while (currentRootNodeUrl != null) {
            const currentRootNodeId = String(currentRootNodeUrl);
            const currentRootNode = this.loader.getRootNodeItem(currentRootNodeId);
            if (currentRootNode == null) {
                throw new Error("rootNode not found");
            }

            const currentNodeUrl = new URL(
                hash,
                currentRootNode.nodeUrl,
            );
            const currentNodeId = String(currentNodeUrl);
            const recursiveAnchorNodeId = this.getRecursiveAnchorNodeId(
                currentNodeId,
            );
            if (recursiveAnchorNodeId != null) {
                resolvedNodeId = recursiveAnchorNodeId;
            }

            currentRootNodeUrl = currentRootNode.referencingNodeUrl;
        }

        return resolvedNodeId;
    }

    /*
    override the super function to load recursive anchors
    */
    protected indexNode(
        node: Schema,
        nodeRootUrl: URL,
        nodePointer: string,
        onNodeMetaSchema: (nodeId: string, metaSchemaId: MetaSchemaId) => void,
    ) {
        const nodeId = this.makeNodeId(
            node,
            nodeRootUrl,
            nodePointer,
        );

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
            const recursiveAnchorId = nodeId;
            if (this.recursiveAnchorMap.has(recursiveAnchorId)) {
                throw new Error("duplicate recursiveAnchorId");
            }
            this.recursiveAnchorMap.set(recursiveAnchorId, nodeId);
        }

        super.indexNode(
            node,
            nodeRootUrl,
            nodePointer,
            onNodeMetaSchema,
        );
    }
}
