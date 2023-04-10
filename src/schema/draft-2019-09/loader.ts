import { SchemaLoaderBase } from "../loader.js";
import { MetaSchemaId } from "../meta.js";
import { metaSchema } from "./meta.js";
import { selectAllSubNodes, selectAllSubNodesAndSelf, selectNodeAnchor, selectNodeId, selectNodeRecursiveAnchor, selectNodeRef, selectSubNodes } from "./selectors.js";
import { Schema } from "./types.js";
import { validateSchema } from "./validators.js";

export class SchemaLoader extends SchemaLoaderBase<Schema> {
    protected readonly metaSchemaId = metaSchema.metaSchemaId;

    public validateSchema(node: Schema): boolean {
        for (const error of validateSchema(node, [])) {
            return false;
        }
        return true;
    }

    public *getReferencedNodeUrls(
        rootNode: Schema,
        rootNodeUrl: URL,
        retrievalUrl: URL,
    ): Iterable<readonly [URL, URL]> {
        for (const [pointer, node] of selectAllSubNodesAndSelf("", rootNode)) {
            const nodeRef = selectNodeRef(node);
            if (nodeRef == null) {
                continue;
            }

            const refNodeUrl = new URL(nodeRef, rootNodeUrl);
            const refRetrievalUrl = new URL(nodeRef, retrievalUrl);
            refRetrievalUrl.hash = "";

            yield [refNodeUrl, refRetrievalUrl] as const;

        }
    }

    public selectNodeUrl(node: Schema) {
        const nodeId = selectNodeId(node);
        if (nodeId != null) {
            const nodeUrl = new URL(nodeId);
            return nodeUrl;
        }
    }

    protected makeNodeUrl(
        node: Schema,
        nodeRootUrl: URL,
        nodePointer: string,
    ): URL {
        let nodeUrl = this.selectNodeUrl(node);
        if (nodeUrl != null) {
            return nodeUrl;
        }

        nodeUrl = new URL(`#${nodePointer}`, nodeRootUrl);
        return nodeUrl;
    }

    public selectSubNodeEntries(
        nodePointer: string,
        node: Schema,
    ): Iterable<readonly [string, Schema]> {
        return selectSubNodes(nodePointer, node);
    }

    public selectAllSubNodeEntries(
        nodePointer: string,
        node: Schema,
    ): Iterable<readonly [string, Schema]> {
        return selectAllSubNodes(nodePointer, node);
    }

    public selectAllSubNodeEntriesAndSelf(
        nodePointer: string,
        node: Schema,
    ): Iterable<readonly [string, Schema]> {
        return selectAllSubNodesAndSelf(nodePointer, node);
    }

    protected async loadFromNode(
        node: Schema,
        nodeUrl: URL,
        retrievalUrl: URL,
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
                this.metaSchemaId,
            );
        }

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
            const currentRootNode = this.getRootNodeItem(currentRootNodeId);

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
        const nodeUrl = this.makeNodeUrl(
            node,
            nodeRootUrl,
            nodePointer,
        );
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
