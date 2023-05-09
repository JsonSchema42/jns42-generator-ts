import camelcase from "camelcase";
import * as fs from "fs";
import { CompoundDescriptorUnion } from "./index.js";
import { MetaSchemaId } from "./meta.js";
import { SchemaStrategy, SchemaStrategyBase } from "./strategy.js";
import { TypeDescriptorUnion } from "./type-descriptors.js";

export class SchemaContext implements SchemaStrategy {
    private readonly rootNodeMetaMap = new Map<string, string>();
    private readonly nodeMetaMap = new Map<string, string>();
    private readonly retrievalRootNodeMap = new Map<string, URL>();
    private readonly rootNodeRetrievalMap = new Map<string, URL>();

    private strategies: Record<string, SchemaStrategyBase<unknown>> = {};

    public registerStrategy(
        metaSchemaId: string,
        strategy: SchemaStrategyBase<unknown>,
    ) {
        this.strategies[metaSchemaId] = strategy;
    }

    public async loadRootNode(
        rootNode: unknown,
        rootNodeUrl: URL,
        referencingNodeUrl: URL | null,
        defaultMetaSchemaId: string,
    ) {
        const metaSchemaId = this.discoverMetaSchemaId(rootNode) ??
            defaultMetaSchemaId;

        const loader: SchemaStrategyBase<unknown> = this.strategies[metaSchemaId];

        await loader.loadRootNode(
            rootNode,
            rootNodeUrl,
            referencingNodeUrl,
        );

        for (const nodeUrl of loader.indexRootNode(rootNodeUrl)) {
            const nodeId = String(nodeUrl);
            this.nodeMetaMap.set(nodeId, metaSchemaId);
        }

    }

    public async loadFromUrl(
        rootNodeUrl: URL,
        retrievalUrl: URL,
        referencingUrl: URL | null,
        defaultMetaSchemaId: string,
    ) {
        const retrievalId = String(retrievalUrl);

        const maybeRootNodeUrl = this.retrievalRootNodeMap.get(retrievalId);
        if (maybeRootNodeUrl != null) {
            return maybeRootNodeUrl;
        }

        const rootNode = await this.fetchJsonFromUrl(
            retrievalUrl,
        );

        const metaSchemaId = this.discoverMetaSchemaId(rootNode) ?? defaultMetaSchemaId;

        const loader: SchemaStrategyBase<unknown> = this.strategies[metaSchemaId];

        if (!loader.isSchema(rootNode)) {
            throw new TypeError("invalid schema");
        }

        rootNodeUrl = loader.selectNodeUrl(rootNode) ?? rootNodeUrl;

        const rootNodeId = String(rootNodeUrl);

        this.retrievalRootNodeMap.set(retrievalId, rootNodeUrl);
        this.rootNodeRetrievalMap.set(rootNodeId, retrievalUrl);
        this.rootNodeMetaMap.set(rootNodeId, metaSchemaId);

        for (
            const [subNodeUrl, subRetrievalUrl] of
            loader.getReferencedNodeUrls(rootNode, rootNodeUrl, retrievalUrl)
        ) {
            await this.loadFromUrl(subNodeUrl, subRetrievalUrl, rootNodeUrl, metaSchemaId);
        }

        await this.loadRootNode(
            rootNode,
            rootNodeUrl,
            referencingUrl,
            defaultMetaSchemaId,
        );

        return rootNodeUrl;
    }

    private async fetchJsonFromUrl(
        url: URL,
    ) {
        switch (url.protocol) {
            case "http:":
            case "http2:": {
                const result = await fetch(url);
                const schemaRootNode = await result.json() as unknown;

                return schemaRootNode;
            }

            case "file:": {
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                const content = fs.readFileSync(url.pathname, "utf-8");

                const schemaRootNode = JSON.parse(content) as unknown;

                return schemaRootNode;
            }
        }
    }

    private discoverMetaSchemaId(
        node: unknown,
    ) {
        for (const [metaSchemaId, loader] of Object.entries(this.strategies)) {
            if (loader.isSchemaRootNode(node)) {
                return metaSchemaId as MetaSchemaId;
            }
        }
    }

    public getNodeRetrievalUrl(nodeRootId: string) {
        return this.rootNodeRetrievalMap.get(nodeRootId);
    }

    public getNodeRootUrl(nodeRetrievalId: string) {
        return this.retrievalRootNodeMap.get(nodeRetrievalId);
    }

    public * getTypeNames() {
        for (const [rootNodeId, metaSchemaId] of this.rootNodeMetaMap) {
            yield* this.getNodeTypeNames(rootNodeId, metaSchemaId);
        }
    }

    private * getNodeTypeNames(
        nodeId: string,
        metaSchemaId: string,
        baseName = "",
    ): Iterable<readonly [string, string]> {
        const reReplace = /[^A-Za-z0-9-_]/gu;
        const reFilter = /^[A-Za-z-_]/u;

        const loader: SchemaStrategyBase<unknown> = this.strategies[metaSchemaId];

        const item = loader.getNodeItem(nodeId);

        const {
            node,
            nodeRootUrl,
            nodePointer,
        } = item;

        const pathParts = nodeRootUrl.pathname.
            split("/").
            map(decodeURI).
            map(value => value.replace(reReplace, "")).
            filter(value => reFilter.test(value));
        const pointerParts = nodePointer.
            split("/").
            map(decodeURI).
            map(value => value.replace(reReplace, ""));

        if (nodePointer === "") {
            baseName = pathParts[pathParts.length - 1] ?? "Schema";
        }

        const nameParts = [
            baseName,
            pointerParts[pointerParts.length - 1],
        ].
            filter(value => value != null).
            filter(value => value != "");

        const name = camelcase(nameParts, { pascalCase: true });

        yield [nodeId, name] as const;

        for (
            const [subNodePointer] of
            loader.selectSubNodeEntries(nodePointer, node)
        ) {
            const subNodeUrl = new URL(`#${subNodePointer}`, nodeRootUrl);
            const subNodeId = String(subNodeUrl);
            yield* this.getNodeTypeNames(
                subNodeId,
                metaSchemaId,
                name,
            );
        }
    }

    public getComments(nodeId: string) {
        const metaSchemaId = this.nodeMetaMap.get(nodeId);
        if (metaSchemaId == null) {
            throw new Error("meta schema id not found");
        }

        const loader = this.strategies[metaSchemaId];
        return loader.getComments(nodeId);
    }

    public getExamples(nodeId: string) {
        const metaSchemaId = this.nodeMetaMap.get(nodeId);
        if (metaSchemaId == null) {
            throw new Error("meta schema id not found");
        }

        const loader = this.strategies[metaSchemaId];
        return loader.getExamples(nodeId);
    }

    public getReferencingNodeId(nodeId: string): string | undefined {
        const metaSchemaId = this.nodeMetaMap.get(nodeId);
        if (metaSchemaId == null) {
            throw new Error("meta schema id not found");
        }

        const loader = this.strategies[metaSchemaId];
        return loader.getReferencingNodeId(nodeId);
    }

    public selectNodeTypeDescriptors(nodeId: string): Iterable<TypeDescriptorUnion> {
        const metaSchemaId = this.nodeMetaMap.get(nodeId);
        if (metaSchemaId == null) {
            throw new Error("meta schema id not found");
        }

        const loader = this.strategies[metaSchemaId];
        return loader.selectNodeTypeDescriptors(nodeId);
    }

    public selectNodeCompoundDescriptors(nodeId: string): Iterable<CompoundDescriptorUnion> {
        const metaSchemaId = this.nodeMetaMap.get(nodeId);
        if (metaSchemaId == null) {
            throw new Error("meta schema id not found");
        }

        const loader = this.strategies[metaSchemaId];
        return loader.selectNodeCompoundDescriptors(nodeId);
    }

}
