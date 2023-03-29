import * as schemaDraft04 from "./draft-04/index.js";
import * as schemaDraft07 from "./draft-06/index.js";
import * as schemaDraft06 from "./draft-07/index.js";
import * as schema201909 from "./draft-2019-09/index.js";
import * as schema202012 from "./draft-2020-12/index.js";

export interface MetaSchemaInfo<K extends string, N> {
    metaSchemaId: K;
    isSchemaRootNode(node: unknown): node is N;
}

export const metaSchemaMap = {
    [schema202012.metaSchema.metaSchemaId]: schema202012.metaSchema,
    [schema201909.metaSchema.metaSchemaId]: schema201909.metaSchema,
    [schemaDraft07.metaSchema.metaSchemaId]: schemaDraft07.metaSchema,
    [schemaDraft06.metaSchema.metaSchemaId]: schemaDraft06.metaSchema,
    [schemaDraft04.metaSchema.metaSchemaId]: schemaDraft04.metaSchema,
};

export type MetaSchemaId = keyof typeof metaSchemaMap;

export function discoverRootNodeMetaSchemaId(
    schemaRootNode: unknown,
) {
    for (const [metaSchemaId, metaSchema] of Object.entries(metaSchemaMap)) {
        if (metaSchema.isSchemaRootNode(schemaRootNode)) {
            return metaSchemaId as MetaSchemaId;
        }
    }
}
