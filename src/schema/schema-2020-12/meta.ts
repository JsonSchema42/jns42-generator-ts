import { MetaSchemaInfo } from "../meta.js";
import { isSchemaRootNode, SchemaNode } from "./node.js";

const metaSchemaId = "https://json-schema.org/draft/2020-12/schema";

export const metaSchema: MetaSchemaInfo<typeof metaSchemaId, SchemaNode> = {
    metaSchemaId,
    isSchemaRootNode,
};
