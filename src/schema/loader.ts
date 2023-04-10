import { SchemaManager } from "./manager.js";
import { MetaSchemaId } from "./meta.js";

export interface SchemaLoaderRootNodeItem<N> {
    node: N;
    nodeUrl: URL;
    referencingNodeUrl: URL | null;
}

export interface SchemaLoaderNodeItem<N> {
    node: N;
    nodeRootUrl: URL;
    nodePointer: string;
}

export abstract class SchemaLoaderBase<N> {
    protected abstract readonly metaSchemaId: MetaSchemaId

    public abstract getReferencedNodeUrls(
        rootNode: N,
        rootNodeUrl: URL,
        retrievalUrl: URL,
    ): Iterable<readonly [URL, URL]>

    public abstract selectNodeUrl(
        node: N
    ): URL | undefined

    protected abstract loadFromNode(
        node: N,
        nodeUrl: URL,
        retrievalUrl: URL,
    ): Promise<void>

    protected abstract makeNodeUrl(
        node: N,
        nodeRootUrl: URL,
        nodePointer: string,
    ): URL

    public selectRootNodeEntries(): Iterable<[URL, N]> {
        return [...this.getRootNodeItems()].
            map(({ nodeUrl, node }) => [nodeUrl, node]);
    }

    public abstract selectSubNodeEntries(
        nodePointer: string,
        node: N
    ): Iterable<readonly [string, N]>

    public abstract selectAllSubNodeEntries(
        nodePointer: string,
        node: N
    ): Iterable<readonly [string, N]>

    public abstract selectAllSubNodeEntriesAndSelf(
        nodePointer: string,
        node: N
    ): Iterable<readonly [string, N]>

    public abstract validateSchema(node: N): boolean

    constructor(
        protected readonly manager: SchemaManager,
    ) {
        //
    }

    private readonly rootNodeMap = new Map<string, SchemaLoaderRootNodeItem<N>>();
    private readonly nodeMap = new Map<string, SchemaLoaderNodeItem<N>>();

    public hasRootNodeItem(nodeId: string) {
        return this.rootNodeMap.has(nodeId);
    }

    public getRootNodeItem(nodeId: string) {
        const item = this.rootNodeMap.get(nodeId);
        if (item == null) {
            throw new Error("root node item not found");
        }
        return item;
    }

    public getRootNodeItems() {
        return this.rootNodeMap.values();
    }

    public async loadRootNode(
        node: N,
        nodeUrl: URL,
        referencingNodeUrl: URL | null,
    ) {
        const nodeId = String(nodeUrl);

        if (this.rootNodeMap.has(nodeId)) {
            throw new Error("rootNode already present");
        }

        const item = {
            node,
            nodeUrl,
            referencingNodeUrl,
        };

        this.rootNodeMap.set(nodeId, item);
    }

    public * indexRootNode(rootNodeUrl: URL): Iterable<URL> {
        const rootNodeId = String(rootNodeUrl);
        const rootItem = this.rootNodeMap.get(rootNodeId);
        if (rootItem == null) {
            throw new Error("rootItem not found");
        }

        for (const [subPointer, subNode] of this.selectAllSubNodeEntriesAndSelf("", rootItem.node)) {
            const subNodeUrl = new URL(`#${subPointer}`, rootNodeUrl);
            const subNodeId = String(subNodeUrl);

            const item: SchemaLoaderNodeItem<N> = {
                node: subNode,
                nodePointer: subPointer,
                nodeRootUrl: rootNodeUrl,
            };
            this.nodeMap.set(subNodeId, item);

            yield subNodeUrl;
        }
    }

    public hasNodeItem(nodeId: string) {
        return this.nodeMap.has(nodeId);
    }

    public getNodeItem(nodeId: string) {
        const item = this.nodeMap.get(nodeId);
        if (item == null) {
            throw new Error("node item not found");
        }
        return item;
    }

    public indexNodes(
        onNodeMetaSchema: (nodeId: string, metaSchemaId: MetaSchemaId) => void,
    ) {
        for (const [url, node] of this.selectRootNodeEntries()) {
            this.indexNode(
                node,
                url,
                "",
                onNodeMetaSchema,
            );
        }
    }

    protected indexNode(
        node: N,
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

        const item: SchemaLoaderNodeItem<N> = {
            node,
            nodeRootUrl,
            nodePointer,
        };
        if (this.nodeMap.has(nodeId)) {
            throw new Error("duplicate nodeId");
        }
        this.nodeMap.set(nodeId, item);
        onNodeMetaSchema(nodeId, this.metaSchemaId);

        for (const [subNodePointer, subNode] of this.selectSubNodeEntries(nodePointer, node)) {
            this.indexNode(
                subNode,
                nodeRootUrl,
                subNodePointer,
                onNodeMetaSchema,
            );
        }
    }

}

