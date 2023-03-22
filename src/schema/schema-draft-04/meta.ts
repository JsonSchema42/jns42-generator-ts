import { MetaSchemaInfo } from "../meta.js";
import { isSchemaRootNode, SchemaNode } from "./node.js";

const metaSchemaKey = "http://json-schema.org/draft-04/schema#";

export const metaSchema: MetaSchemaInfo<typeof metaSchemaKey, SchemaNode> = {
    metaSchemaKey,
    isSchemaRootNode,
};
