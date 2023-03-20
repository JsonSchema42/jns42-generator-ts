import { metaSchema } from "./meta.js";
import { selectNodeSchemaUrl } from "./selectors.js";

export type SchemaNode = unknown;

export function isSchemaRootNode(node: unknown): node is SchemaNode {
    const schemaUrl = selectNodeSchemaUrl(node);
    if (schemaUrl == null) {
        return false;
    }
    const schemaKey = String(schemaUrl);
    return schemaKey === metaSchema.metaSchemaKey;
}
