import * as schema201909 from "./schema-2019-09/index.js";
import * as schema202012 from "./schema-2020-12/index.js";
import * as schemaDraft04 from "./schema-draft-04/index.js";
import * as schemaDraft07 from "./schema-draft-06/index.js";
import * as schemaDraft06 from "./schema-draft-07/index.js";

export class SchemaManager {

    private readonly schemaMetaMap = {
        [schema202012.schemaMeta.metaSchemaKey]: schema202012.schemaMeta,
        [schema201909.schemaMeta.metaSchemaKey]: schema201909.schemaMeta,
        [schemaDraft07.schemaMeta.metaSchemaKey]: schemaDraft07.schemaMeta,
        [schemaDraft06.schemaMeta.metaSchemaKey]: schemaDraft06.schemaMeta,
        [schemaDraft04.schemaMeta.metaSchemaKey]: schemaDraft04.schemaMeta,
    };

    private readonly loaders = Object.fromEntries(
        Object.entries(this.schemaMetaMap).
            map(([key, value]) => [key, value.newSchemaLoader(this)] as const),
    ) as {
            [K in keyof typeof this.schemaMetaMap]: ReturnType<typeof this.schemaMetaMap[K]["newSchemaLoader"]>
        };

    public async loadFromURL(
        instanceUrl: URL,
        referencingInstanceUrl: URL | null,
        defaultMetaSchemaUrl: URL,
    ) {
        const result = await fetch(instanceUrl);
        const schemaRootNode = await result.json() as unknown;

        await this.loadFromNode(
            schemaRootNode,
            instanceUrl,
            referencingInstanceUrl,
            defaultMetaSchemaUrl,
        );
    }

    public async loadFromNode(
        schemaRootNode: unknown,
        instanceUrl: URL,
        referencingInstanceUrl: URL | null,
        defaultMetaSchemaUrl: URL,
    ) {
        const rootNodeSchemaMetaKey = this.getRootNodeMetaSchemaKey(
            schemaRootNode,
            defaultMetaSchemaUrl,
        );

        if (rootNodeSchemaMetaKey == null) {
            throw new Error("meta schema not supported");
        }

        // eslint-disable-next-line security/detect-object-injection
        const loader = this.loaders[rootNodeSchemaMetaKey];
        await loader.loadFromNode(
            schemaRootNode,
            instanceUrl,
            referencingInstanceUrl,
        );
    }

    private getRootNodeMetaSchemaKey(
        schemaRootNode: unknown,
        defaultMetaSchemaUrl: URL,
    ) {
        for (const [schemaKey, schemaMeta] of Object.entries(this.schemaMetaMap)) {
            if (schemaMeta.isSchemaRootNode(schemaRootNode)) {
                return schemaKey as keyof typeof this.schemaMetaMap;
            }
        }

        const defaultMetaSchemaKey =
            String(defaultMetaSchemaUrl) as keyof typeof this.schemaMetaMap;
        if (defaultMetaSchemaKey in this.schemaMetaMap) {
            return defaultMetaSchemaKey;
        }

        return null;
    }

}
