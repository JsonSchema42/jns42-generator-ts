import * as schema201909 from "./schema-2019-09/index.js";
import * as schema202012 from "./schema-2020-12/index.js";
import * as schemaDraft04 from "./schema-draft-04/index.js";
import * as schemaDraft07 from "./schema-draft-06/index.js";
import * as schemaDraft06 from "./schema-draft-07/index.js";

export interface MetaSchemaInfo<K extends string, N> {
    metaSchemaKey: K;
    isSchemaRootNode(node: unknown): node is N;
}

export const metaSchemaMap = {
    [schema202012.metaSchema.metaSchemaKey]: schema202012.metaSchema,
    [schema201909.metaSchema.metaSchemaKey]: schema201909.metaSchema,
    [schemaDraft07.metaSchema.metaSchemaKey]: schemaDraft07.metaSchema,
    [schemaDraft06.metaSchema.metaSchemaKey]: schemaDraft06.metaSchema,
    [schemaDraft04.metaSchema.metaSchemaKey]: schemaDraft04.metaSchema,
};

export type MetaSchemaKey = keyof typeof metaSchemaMap;

export function discoverRootNodeMetaSchemaKey(
    schemaRootNode: unknown,
) {
    for (const [schemaKey, schemaMeta] of Object.entries(metaSchemaMap)) {
        if (schemaMeta.isSchemaRootNode(schemaRootNode)) {
            return schemaKey as MetaSchemaKey;
        }
    }
}
