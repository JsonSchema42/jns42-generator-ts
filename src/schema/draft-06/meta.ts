import { SchemaMeta } from "../meta.js";
import { SchemaLoader } from "./loader.js";
import { isSchemaRootNode, SchemaNode } from "./node.js";

const metaSchemaKey = "https://json-schema.org/draft-06/schema";

export const schemaMeta: SchemaMeta<typeof metaSchemaKey, SchemaNode> = {
    metaSchemaKey,
    metaSchemaUrl: new URL(metaSchemaKey),

    isSchemaRootNode,

    newSchemaLoader: commonSchemaLoader => new SchemaLoader(commonSchemaLoader),
};
