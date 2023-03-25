import { MetaSchemaInfo } from "../meta.js";
import { isSchemaRootNode, SchemaNode } from "./node.js";

const metaSchemaId = "http://json-schema.org/draft-06/schema#";

export const metaSchema: MetaSchemaInfo<typeof metaSchemaId, SchemaNode> = {
    metaSchemaId,
    isSchemaRootNode,
};
