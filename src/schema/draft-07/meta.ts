import { SchemaMeta } from "../meta.js";
import { SchemaLoader } from "./loader.js";
import { SchemaNode } from "./node.js";

const metaSchemaKey = "https://json-schema.org/draft-07/schema";

export const schemaMeta: SchemaMeta<typeof metaSchemaKey, SchemaNode> = {
    metaSchemaKey,
    metaSchemaUrl: new URL(metaSchemaKey),

    isSchemaRootNode(node: unknown): node is SchemaNode {
        return (
            typeof node === "object" &&
            node != null &&
            "$schema" in node &&
            typeof node.$schema === String(schemaMeta.metaSchemaUrl)
        );
    },

    newSchemaLoader: commonSchemaLoader => new SchemaLoader(commonSchemaLoader),
};
