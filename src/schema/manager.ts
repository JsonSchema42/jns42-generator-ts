import { MetaSchemaKey, metaSchemaMap } from "./meta.js";

export class SchemaManager {

    private readonly rootNodeMetaMap = new Map<string, MetaSchemaKey>();

    public registerRootNodeMetaSchema(
        nodeId: string,
        schemaMetaKey: MetaSchemaKey,
    ) {
        this.rootNodeMetaMap.set(nodeId, schemaMetaKey);
    }

    private readonly loaders = Object.fromEntries(
        Object.entries(metaSchemaMap).
            map(([key, value]) => [key, value.newSchemaLoader(this)] as const),
    );

    public async loadFromURL(
        url: URL,
        referencingUrl: URL | null,
        defaultMetaSchemaKey: MetaSchemaKey,
    ) {
        const result = await fetch(url);
        const schemaRootNode = await result.json() as unknown;

        await this.loadFromNode(
            schemaRootNode,
            url,
            referencingUrl,
            defaultMetaSchemaKey,
        );
    }

    public async loadFromNode(
        node: unknown,
        nodeUrl: URL,
        referencingNodeUrl: URL | null,
        defaultMetaSchemaKey: MetaSchemaKey,
    ) {
        const rootNodeSchemaMetaKey = this.getRootNodeMetaSchemaKey(
            node,
            defaultMetaSchemaKey,
        );

        // eslint-disable-next-line security/detect-object-injection
        const loader = this.loaders[rootNodeSchemaMetaKey];
        await loader.loadFromNode(
            node,
            nodeUrl,
            referencingNodeUrl,
        );
    }

    private getRootNodeMetaSchemaKey(
        schemaRootNode: unknown,
        defaultMetaSchemaKey: MetaSchemaKey,
    ) {
        for (const [schemaKey, schemaMeta] of Object.entries(metaSchemaMap)) {
            if (schemaMeta.isSchemaRootNode(schemaRootNode)) {
                return schemaKey as MetaSchemaKey;
            }
        }

        return defaultMetaSchemaKey;
    }

}
