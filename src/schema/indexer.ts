import { SchemaManager } from "./manager.js";
import { MetaSchemaId } from "./meta.js";

export interface SchemaIndexerNodeItem<N> {
    node: N;
    nodeRootUrl: URL;
    nodePointer: string;
}

export abstract class SchemaIndexerBase<N> {
    protected abstract readonly metaSchemaId: MetaSchemaId

    protected abstract getRootNodeEntries(): Iterable<[URL, N]>;
    protected abstract toNodeUrl(nodePointer: string, nodeRootUrl: URL): URL
    protected abstract selectNodeInstanceEntries(
        nodePointer: string,
        node: N
    ): Iterable<readonly [string, N]>

    private readonly nodeMap = new Map<string, SchemaIndexerNodeItem<N>>();

    constructor(
        protected readonly manager: SchemaManager,
    ) {
        //
    }

    public getNodeItem(nodeId: string) {
        return this.nodeMap.get(nodeId);
    }

    public indexNodes() {
        for (const [url, node] of this.getRootNodeEntries()) {
            this.indexNode(
                node,
                url,
                "",
            );
        }
    }

    protected indexNode(
        node: N,
        nodeRootUrl: URL,
        nodePointer: string,
    ) {
        const nodeUrl = this.toNodeUrl(nodePointer, nodeRootUrl);
        const nodeId = String(nodeUrl);

        const item: SchemaIndexerNodeItem<N> = {
            node,
            nodeRootUrl,
            nodePointer,
        };
        if (this.nodeMap.has(nodeId)) {
            throw new Error("duplicate nodeId");
        }
        this.nodeMap.set(nodeId, item);
        this.manager.registerNodeMetaSchema(nodeId, this.metaSchemaId);

        for (const [subNodePointer, subNode] of this.selectNodeInstanceEntries(nodePointer, node)) {
            this.indexNode(
                subNode,
                nodeRootUrl,
                subNodePointer,
            );
        }
    }

}

