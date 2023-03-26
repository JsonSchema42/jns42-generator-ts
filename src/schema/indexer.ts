import { SchemaManager } from "./manager.js";
import { MetaSchemaId } from "./meta.js";

export interface SchemaIndexerNodeItem<N> {
    node: N;
    nodeRootUrl: URL;
    nodePointer: string;
}

export abstract class SchemaIndexerBase<N> {
    protected abstract readonly metaSchemaId: MetaSchemaId

    protected abstract makeNodeId(
        node: N,
        nodeRootUrl: URL,
        nodePointer: string,
    ): string
    public abstract selectRootNodeEntries(): Iterable<[URL, N]>;
    public abstract selectSubNodeEntries(
        nodePointer: string,
        node: N
    ): Iterable<readonly [string, N]>

    constructor(
        protected readonly manager: SchemaManager,
    ) {
        //
    }

    private readonly nodeMap = new Map<string, SchemaIndexerNodeItem<N>>();

    public getNodeItem(nodeId: string) {
        return this.nodeMap.get(nodeId);
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
        const nodeId = this.makeNodeId(
            node,
            nodeRootUrl,
            nodePointer,
        );

        const item: SchemaIndexerNodeItem<N> = {
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

