import { metaSchema } from "./meta.js";
import { selectNodeSchema } from "./selectors.js";

export type SchemaNode = unknown;

export function isSchemaRootNode(node: unknown): node is SchemaNode {
    const schemaId = selectNodeSchema(node);
    if (schemaId == null) {
        return false;
    }
    return schemaId === metaSchema.metaSchemaId;
}
