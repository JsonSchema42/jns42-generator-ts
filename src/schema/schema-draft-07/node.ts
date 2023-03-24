import { metaSchema } from "./meta.js";
import { selectNodeSchema } from "./selectors.js";

export type SchemaNode = unknown;

export function isSchemaRootNode(node: unknown): node is SchemaNode {
    const schemaKey = selectNodeSchema(node);
    if (schemaKey == null) {
        return false;
    }
    return schemaKey === metaSchema.metaSchemaKey;
}
