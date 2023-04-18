import { SchemaLoaderBase } from "../loader.js";
import { metaSchemaId } from "./meta.js";
import { selectAllSubNodes, selectAllSubNodesAndSelf, selectNodeAnchor, selectNodeDeprecated, selectNodeDescription, selectNodeDynamicAnchor, selectNodeId, selectNodeRef, selectNodeSchema, selectSubNodes } from "./selectors.js";
import { Schema } from "./types.js";
import { validateSchema } from "./validators.js";

export class SchemaLoader extends SchemaLoaderBase<Schema> {

    protected readonly metaSchemaId = metaSchemaId;

    public isSchemaRootNode(node: unknown): node is Schema {
        const schemaId = selectNodeSchema(node as any);
        if (schemaId == null) {
            return false;
        }
        return schemaId === this.metaSchemaId;
    }

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
    private readonly dynamicAnchorMap = new Map<string, string>();

    public getAnchorNodeId(nodeId: string) {
        return this.anchorMap.get(nodeId);
    }

    public getDynamicAnchorNodeId(nodeId: string) {
        return this.dynamicAnchorMap.get(nodeId);
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

    public resolveDynamicReferenceNodeId(nodeId: string, nodeDynamicRef: string) {
        const nodeItem = this.getNodeItem(nodeId);

        const nodeRootId = String(nodeItem.nodeRootUrl);
        const nodeRetrievalUrl = this.manager.getNodeRetrievalUrl(nodeRootId);

        const nodeRefRetrievalUrl = new URL(nodeDynamicRef, nodeRetrievalUrl);
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
            const dynamicAnchorNodeId = this.getDynamicAnchorNodeId(
                currentNodeId,
            );
            if (dynamicAnchorNodeId != null) {
                resolvedNodeId = dynamicAnchorNodeId;
            }

            currentRootNodeUrl = currentRootNode.referencingNodeUrl;
        }

        return resolvedNodeId;
    }

    /*
    override the super function to load dynamic anchors
    */
    protected * indexNode(
        node: Schema,
        nodeRootUrl: URL,
        nodePointer: string,
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

            yield anchorUrl;
        }

        const nodeDynamicAnchor = selectNodeDynamicAnchor(node);
        if (nodeDynamicAnchor != null) {
            const dynamicAnchorUrl = new URL(`#${nodeDynamicAnchor}`, nodeRootUrl);
            const dynamicAnchorId = String(dynamicAnchorUrl);
            if (this.dynamicAnchorMap.has(dynamicAnchorId)) {
                throw new Error("duplicate dynamicAnchorId");
            }
            this.dynamicAnchorMap.set(dynamicAnchorId, nodeId);

            // TODO should wel yield this?
            // yield dynamicAnchorUrl;
        }

        yield* super.indexNode(
            node,
            nodeRootUrl,
            nodePointer,
        );
    }

    public getComments(nodeId: string): string {
        const nodeItem = this.getNodeItem(nodeId);

        const description = selectNodeDescription(nodeItem.node) ?? "";
        const deprecated = selectNodeDeprecated(nodeItem.node) ?? false;

        const lines = [
            description,
            deprecated ? "@deprecated" : "",
        ].
            map(line => line.trim()).
            filter(line => line.length > 0).
            map(line => line + "\n").
            join("");

        return lines;
    }

}
