import { SchemaCollection } from "./schema-collection.js";
import { selectNodeAnchorUrl, selectNodeDynamicAnchorUrl, selectNodeIdUrl, selectNodeInstanceEntries } from "./selectors/index.js";

export interface SchemaIndexerNodeItem {
    instanceUrl: URL;
    nodeUrl: URL;
    node: unknown,
}

export class SchemaIndexer {
    private anchorMap = new Map<string, URL>();
    private dynamicAnchorMap = new Map<string, URL>();
    private nodeItemMap = new Map<string, SchemaIndexerNodeItem>();

    constructor(schemaCollection: SchemaCollection) {
        this.loadFromSchemaCollectionInstanceItems(schemaCollection);
    }

    public get anchorCount() {
        return this.anchorMap.size;
    }

    public get dynamicAnchorCount() {
        return this.dynamicAnchorMap.size;
    }

    public get nodeCount() {
        return this.nodeItemMap.size;
    }

    public getNodeItems(): Iterable<SchemaIndexerNodeItem> {
        return this.nodeItemMap.values();
    }

    public getNodeItem(nodeUrl: URL): SchemaIndexerNodeItem | undefined {
        const nodeKey = String(nodeUrl);

        return this.nodeItemMap.get(nodeKey);
    }

    private loadFromSchemaCollectionInstanceItems(schemaCollection: SchemaCollection) {
        for (const instanceItem of schemaCollection.getInstanceItems()) {
            this.loadFromSchemaCollectionInstanceItem(
                instanceItem.instanceUrl,
                instanceItem.instanceUrl,
                instanceItem.instanceNode,
            );
        }
    }

    private loadFromSchemaCollectionInstanceItem(
        instanceUrl: URL,
        nodeUrl: URL,
        node: unknown,
    ) {
        const idUrl = selectNodeIdUrl(node);
        if (idUrl != null) {
            nodeUrl = idUrl;
        }

        const anchorUrl = selectNodeAnchorUrl(nodeUrl, node);
        if (anchorUrl != null) {
            const anchorKey = String(anchorUrl);
            if (this.anchorMap.has(anchorKey)) {
                throw new Error("duplicate identifier");
            }
            this.anchorMap.set(anchorKey, nodeUrl);
        }

        const dynamicAnchorUrl = selectNodeDynamicAnchorUrl(nodeUrl, node);
        if (dynamicAnchorUrl != null) {
            const dynamicAnchorKey = String(dynamicAnchorUrl);
            if (this.dynamicAnchorMap.has(dynamicAnchorKey)) {
                throw new Error("duplicate identifier");
            }
            this.dynamicAnchorMap.set(dynamicAnchorKey, nodeUrl);
        }

        const nodeKey = String(nodeUrl);
        if (this.nodeItemMap.has(nodeKey)) {
            throw new Error("duplicate identifier");
        }
        this.nodeItemMap.set(nodeKey, {
            instanceUrl,
            nodeUrl,
            node,
        });

        for (const [childNodeUrl, childNode] of selectNodeInstanceEntries(nodeUrl, node)) {
            this.loadFromSchemaCollectionInstanceItem(
                instanceUrl,
                childNodeUrl,
                childNode,
            );
        }

    }

}
