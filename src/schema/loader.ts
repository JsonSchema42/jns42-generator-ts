import { SchemaManager } from "./manager.js";
import { MetaSchemaId } from "./meta.js";

export interface SchemaLoaderRootNodeItem<N> {
    node: N;
    nodeUrl: URL;
    referencingNodeUrl: URL | null;
}

export abstract class SchemaLoaderBase<N> {
    protected abstract readonly metaSchemaId: MetaSchemaId

    protected abstract selectNodeId(
        node: N
    ): string | undefined
    protected abstract selectSubNodeEntries(
        nodePointer: string,
        node: N
    ): Iterable<readonly [string, N]>

    protected abstract loadFromNode(
        node: N,
        nodeUrl: URL,
        retrievalUrl: URL,
    ): Promise<void>

    public abstract validateSchema(node: N): boolean

    constructor(
        protected readonly manager: SchemaManager,
    ) {
        //
    }

    private readonly rootNodeMap = new Map<string, SchemaLoaderRootNodeItem<N>>();

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

    public async loadFromRootNode(
        node: N,
        nodeUrl: URL,
        retrievalUrl: URL,
        referencingNodeUrl: URL | null,
        onRootNodeMetaSchema: (rootNodeId: string, metaSchemaId: MetaSchemaId) => void,
    ) {
        let nodeId = String(nodeUrl);

        const maybeNodeId = this.selectNodeId(node);
        if (maybeNodeId != null) {
            nodeUrl = new URL(maybeNodeId);
            nodeId = String(nodeUrl);
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

        onRootNodeMetaSchema(nodeId, this.metaSchemaId);

        await this.loadFromNode(node, nodeUrl, retrievalUrl);

        await this.loadFromSubNodes(
            node,
            nodeUrl,
            retrievalUrl,
            "",
        );

        return nodeUrl;
    }

    private async loadFromSubNodes(
        node: N,
        nodeUrl: URL,
        retrievalUrl: URL,
        nodePointer: string,
    ) {
        for (const [subNodePointer, subNode] of this.selectSubNodeEntries(nodePointer, node)) {
            await this.loadFromNode(subNode, nodeUrl, retrievalUrl);

            await this.loadFromSubNodes(
                subNode,
                nodeUrl,
                retrievalUrl,
                subNodePointer,
            );
        }
    }

}

