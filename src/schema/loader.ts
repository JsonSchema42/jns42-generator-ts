import { CompoundDescriptorUnion } from "./compound-descriptors.js";
import { SchemaManager } from "./manager.js";
import { MetaSchemaId } from "./meta.js";
import { TypeDescriptorUnion } from "./type-descriptors.js";

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

export interface LoaderStrategy {
    getComments(nodeId: string): string
    getExamples(nodeId: string): unknown[];
    getReferencingNodeId(nodeId: string): string | undefined;
    selectNodeTypeDescriptors(nodeId: string): Iterable<TypeDescriptorUnion>;
    selectNodeCompoundDescriptors(nodeId: string): Iterable<CompoundDescriptorUnion>;
}

export abstract class SchemaLoaderBase<N> implements LoaderStrategy {

    public abstract getComments(
        nodeId: string
    ): string

    public abstract getExamples(
        nodeId: string
    ): unknown[]

    public abstract selectNodeTypeDescriptors(
        nodeId: string
    ): Iterable<TypeDescriptorUnion>

    public abstract selectNodeCompoundDescriptors(
        nodeId: string
    ): Iterable<CompoundDescriptorUnion>

    public abstract getReferencingNodeId(
        nodeId: string
    ): string | undefined

    protected abstract readonly metaSchemaId: MetaSchemaId

    public abstract isSchemaRootNode(node: unknown): node is N;

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
            yield* this.indexNode(subNode, rootNodeUrl, subPointer);

        }
    }

    protected *indexNode(
        node: N,
        nodeRootUrl: URL,
        nodePointer: string,
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

}

