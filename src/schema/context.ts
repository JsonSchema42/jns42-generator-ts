import camelcase from "camelcase";
import * as fs from "fs";
import { CompoundUnion, Node, TypeUnion } from "./intermediate.js";
import { SchemaStrategyBase, SchemaStrategyInterface } from "./strategy.js";

export class SchemaContext implements SchemaStrategyInterface {
    private readonly rootNodeMetaMap = new Map<string, string>();
    private readonly nodeMetaMap = new Map<string, string>();
    private readonly retrievalRootNodeMap = new Map<string, URL>();
    private readonly rootNodeRetrievalMap = new Map<string, URL>();

    private strategies: Record<string, SchemaStrategyBase<unknown>> = {};

    public registerStrategy(metaSchemaId: string, strategy: SchemaStrategyBase<unknown>) {
        strategy.registerContext(this);
        this.strategies[metaSchemaId] = strategy;
    }

    public async loadRootNode(
        rootNode: unknown,
        rootNodeUrl: URL,
        referencingNodeUrl: URL | null,
        defaultMetaSchemaId: string
    ) {
        const metaSchemaId = this.discoverMetaSchemaId(rootNode) ?? defaultMetaSchemaId;

        const strategy: SchemaStrategyBase<unknown> = this.strategies[metaSchemaId];

        await strategy.loadRootNode(rootNode, rootNodeUrl, referencingNodeUrl);

        for (const nodeUrl of strategy.indexRootNode(rootNodeUrl)) {
            const nodeId = String(nodeUrl);
            this.nodeMetaMap.set(nodeId, metaSchemaId);
        }
    }

    public async loadFromUrl(
        rootNodeUrl: URL,
        retrievalUrl: URL,
        referencingUrl: URL | null,
        defaultMetaSchemaId: string
    ) {
        const retrievalId = String(retrievalUrl);

        const maybeRootNodeUrl = this.retrievalRootNodeMap.get(retrievalId);
        if (maybeRootNodeUrl != null) {
            return maybeRootNodeUrl;
        }

        const rootNode = await this.fetchJsonFromUrl(retrievalUrl);

        const metaSchemaId = this.discoverMetaSchemaId(rootNode) ?? defaultMetaSchemaId;

        const strategy: SchemaStrategyBase<unknown> = this.strategies[metaSchemaId];

        if (!strategy.isSchema(rootNode)) {
            throw new TypeError("invalid schema");
        }

        rootNodeUrl = strategy.makeNodeUrl(rootNode, retrievalUrl, "");

        const rootNodeId = String(rootNodeUrl);

        this.retrievalRootNodeMap.set(retrievalId, rootNodeUrl);
        this.rootNodeRetrievalMap.set(rootNodeId, retrievalUrl);
        this.rootNodeMetaMap.set(rootNodeId, metaSchemaId);

        for (const [subNodeUrl, subRetrievalUrl] of strategy.selectAllReferencedNodeUrls(
            rootNode,
            rootNodeUrl,
            retrievalUrl
        )) {
            await this.loadFromUrl(subNodeUrl, subRetrievalUrl, rootNodeUrl, metaSchemaId);
        }

        await this.loadRootNode(rootNode, rootNodeUrl, referencingUrl, defaultMetaSchemaId);

        return rootNodeUrl;
    }

    private async fetchJsonFromUrl(url: URL) {
        switch (url.protocol) {
            case "http:":
            case "http2:": {
                const result = await fetch(url);
                const schemaRootNode = (await result.json()) as unknown;

                return schemaRootNode;
            }

            case "file:": {
                const content = fs.readFileSync(url.pathname, "utf-8");

                const schemaRootNode = JSON.parse(content) as unknown;

                return schemaRootNode;
            }
        }
    }

    private discoverMetaSchemaId(node: unknown) {
        for (const [metaSchemaId, strategy] of Object.entries(this.strategies)) {
            if (strategy.isSchemaRootNode(node)) {
                return metaSchemaId;
            }
        }
    }

    public getNodeRetrievalUrl(nodeRootId: string) {
        return this.rootNodeRetrievalMap.get(nodeRootId);
    }

    public getNodeRootUrl(nodeRetrievalId: string) {
        return this.retrievalRootNodeMap.get(nodeRetrievalId);
    }

    public *getTypeNames() {
        for (const [rootNodeId, metaSchemaId] of this.rootNodeMetaMap) {
            yield* this.getNodeTypeNames(rootNodeId, metaSchemaId);
        }
    }

    private *getNodeTypeNames(
        nodeId: string,
        metaSchemaId: string,
        baseName = ""
    ): Iterable<readonly [string, string]> {
        const reReplace = /[^A-Za-z0-9-_.,]/gu;

        const strategy: SchemaStrategyBase<unknown> = this.strategies[metaSchemaId];

        const item = strategy.getNodeItem(nodeId);

        const { node, nodeRootUrl, nodePointer } = item;

        const pathParts = nodeRootUrl.pathname
            .split("/")
            .map(decodeURI)
            .map((value) => value.replace(reReplace, ""))
            .filter((value) => value !== "");
        const pointerParts = nodePointer
            .split("/")
            .map(decodeURI)
            .map((value) => value.replace(reReplace, ""));

        if (nodePointer === "") {
            baseName = pathParts[pathParts.length - 1] ?? "Schema";
        }

        const nameParts = [baseName, pointerParts[pointerParts.length - 1]]
            .filter((value) => value != null)
            .filter((value) => value != "");

        const name = camelcase(nameParts, { pascalCase: true });

        yield [nodeId, name] as const;

        for (const [subNodePointer] of strategy.selectSubNodeEntries(nodePointer, node)) {
            const subNodeUrl = new URL(`#${subNodePointer}`, nodeRootUrl);
            const subNodeId = String(subNodeUrl);
            yield* this.getNodeTypeNames(subNodeId, metaSchemaId, name);
        }
    }

    public *selectNodes(): Iterable<Node> {
        for (const strategy of Object.values(this.strategies)) {
            yield* strategy.selectNodes();
        }
    }

    public selectNodeTypes(nodeId: string): Iterable<TypeUnion> {
        const metaSchemaId = this.nodeMetaMap.get(nodeId);
        if (metaSchemaId == null) {
            throw new Error("meta schema id not found");
        }

        const strategy = this.strategies[metaSchemaId];
        return strategy.selectNodeTypes(nodeId);
    }

    public selectNodeCompounds(nodeId: string): Iterable<CompoundUnion> {
        const metaSchemaId = this.nodeMetaMap.get(nodeId);
        if (metaSchemaId == null) {
            throw new Error("meta schema id not found");
        }

        const strategy = this.strategies[metaSchemaId];
        return strategy.selectNodeCompounds(nodeId);
    }
}
