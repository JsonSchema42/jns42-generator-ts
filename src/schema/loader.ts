import * as schema201909 from "./2019-09/index.js";
import * as schema202012 from "./2020-12/index.js";
import * as schemaDraft04 from "./draft-04/index.js";
import * as schemaDraft07 from "./draft-06/index.js";
import * as schemaDraft06 from "./draft-07/index.js";

export class SchemaLoader {

    schemaMetaMap = Object.fromEntries(
        [
            schema202012.schemaMeta,
            schema201909.schemaMeta,
            schemaDraft07.schemaMeta,
            schemaDraft06.schemaMeta,
            schemaDraft04.schemaMeta,
        ].
            map(
                schemaMeta => [String(schemaMeta.metaSchemaUrl), schemaMeta] as const,
            ),
    );

    async loadFromURL(
        schemaUrl: URL,
        defaultMetaSchemaUrl: URL,
    ) {
        const result = await fetch(schemaUrl);
        const schemaRootNode = await result.json() as unknown;

        this.loadFromNode(schemaRootNode, defaultMetaSchemaUrl);
    }

    loadFromNode(
        schemaRootNode: unknown,
        defaultMetaSchemaUrl: URL,
    ) {
        const rootNodeSchemaMeta = this.getRootNodeMetaSchema(
            schemaRootNode,
            defaultMetaSchemaUrl,
        );

        if (rootNodeSchemaMeta == null) {
            throw new Error("meta schema not supported");
        }
    }

    private getRootNodeMetaSchema(
        schemaRootNode: unknown,
        defaultMetaSchemaUrl: URL,
    ) {
        for (const schemaMeta of Object.values(this.schemaMetaMap)) {
            if (schemaMeta.isSchemaRootNode(schemaRootNode)) {
                return schemaMeta;
            }
        }

        const defaultMetaSchemaKey = String(defaultMetaSchemaUrl);
        if (defaultMetaSchemaKey in this.schemaMetaMap) {
            return this.schemaMetaMap[String(defaultMetaSchemaKey)];
        }

        return null;
    }

}
