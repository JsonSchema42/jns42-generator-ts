import { MetaSchemaInfo } from "../meta.js";
import { SchemaLoader } from "./loader.js";
import { isSchemaRootNode, SchemaNode } from "./node.js";

const metaSchemaKey = "https://json-schema.org/draft-07/schema";

export const metaSchema: MetaSchemaInfo<typeof metaSchemaKey, SchemaNode> = {
    metaSchemaKey,
    isSchemaRootNode,
    newSchemaLoader: commonSchemaLoader => new SchemaLoader(commonSchemaLoader),
};
