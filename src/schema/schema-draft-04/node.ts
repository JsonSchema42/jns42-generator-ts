import { metaSchema } from "./meta.js";
import { selectNodeSchema } from "./selectors.js";
import { Schema } from "./types.js";

export function isSchemaRootNode(node: any): node is Schema {
    const schemaId = selectNodeSchema(node);
    if (schemaId == null) {
        return false;
    }
    return schemaId === metaSchema.metaSchemaId;
}
