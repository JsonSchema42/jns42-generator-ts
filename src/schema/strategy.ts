import assert from "assert";
import { SchemaContext } from "./context.js";
import { CompoundUnion, Node, TypeUnion } from "./intermediate.js";

export interface SchemaStrategyInterface {
    selectNodes(): Iterable<Node>;
    selectNodeTypes(nodeId: string): Iterable<TypeUnion>;
    selectNodeCompounds(nodeId: string): Iterable<CompoundUnion>;
}

export interface SchemaStrategyRootNodeItem<N> {
    node: N;
    nodeUrl: URL;
    referencingNodeUrl: URL | null;
}

export interface SchemaStrategyNodeItem<N> {
    node: N;
    nodeRootUrl: URL;
    nodePointer: string;
}

export abstract class SchemaStrategyBase<N> implements SchemaStrategyInterface {
    protected abstract readonly metaSchemaId: string;

    public abstract isSchemaRootNode(node: unknown): node is N;

    public abstract isSchema(node: unknown): node is N;

    protected abstract loadFromNode(node: N, nodeUrl: URL, retrievalUrl: URL): Promise<void>;

    protected abstract makeNodeUrl(node: N, nodeRootUrl: URL, nodePointer: string): URL;

    public selectRootNodeEntries(): Iterable<[URL, N]> {
        return [...this.getRootNodeItems()].map(({ nodeUrl, node }) => [nodeUrl, node]);
    }

    public abstract selectSubNodeEntries(
        nodePointer: string,
        node: N
    ): Iterable<readonly [string, N]>;

    public abstract selectAllSubNodeEntries(
        nodePointer: string,
        node: N
    ): Iterable<readonly [string, N]>;

    public abstract selectAllSubNodeEntriesAndSelf(
        nodePointer: string,
        node: N
    ): Iterable<readonly [string, N]>;

    public abstract selectAllReferencedNodeUrls(
        rootNode: N,
        rootNodeUrl: URL,
        retrievalUrl: URL
    ): Iterable<readonly [URL, URL]>;

    public abstract selectNodeUrl(node: N): URL | undefined;

    public abstract selectNodes(): Iterable<Node>;

    public abstract selectNodeTypes(nodeId: string): Iterable<TypeUnion>;

    public abstract selectNodeCompounds(nodeId: string): Iterable<CompoundUnion>;

    private maybeContext?: SchemaContext;
    protected get context() {
        assert(this.maybeContext != null);
        return this.maybeContext;
    }
    public registerContext(context: SchemaContext) {
        this.maybeContext = context;
    }

    private readonly rootNodeMap = new Map<string, SchemaStrategyRootNodeItem<N>>();
    private readonly nodeMap = new Map<string, SchemaStrategyNodeItem<N>>();

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

    public async loadRootNode(node: N, nodeUrl: URL, referencingNodeUrl: URL | null) {
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

    public *indexRootNode(rootNodeUrl: URL): Iterable<URL> {
        const rootNodeId = String(rootNodeUrl);
        const rootItem = this.rootNodeMap.get(rootNodeId);
        if (rootItem == null) {
            throw new Error("rootItem not found");
        }

        for (const [subPointer, subNode] of this.selectAllSubNodeEntriesAndSelf(
            "",
            rootItem.node
        )) {
            yield* this.indexNode(subNode, rootNodeUrl, subPointer);
        }
    }

    protected *indexNode(node: N, nodeRootUrl: URL, nodePointer: string) {
        const nodeUrl = this.makeNodeUrl(node, nodeRootUrl, nodePointer);
        const nodeId = String(nodeUrl);

        const item: SchemaStrategyNodeItem<N> = {
            node,
            nodeRootUrl,
            nodePointer,
        };
        if (this.nodeMap.has(nodeId)) {
            throw new Error("duplicate nodeId");
        }
        this.nodeMap.set(nodeId, item);
        yield nodeUrl;
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

    public getNodeItemEntries() {
        return this.nodeMap.entries();
    }
}
