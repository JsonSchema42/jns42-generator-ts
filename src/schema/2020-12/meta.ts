import { SchemaMeta } from "../meta.js";
import { SchemaNode } from "./node.js";

export const schemaMeta: SchemaMeta<SchemaNode> = {
    metaSchemaUrl: new URL("https://json-schema.org/draft/2020-12/schema"),

    isSchemaRootNode(node: unknown): node is SchemaNode {
        return (
            typeof node === "object" &&
            node != null &&
            "$schema" in node &&
            typeof node.$schema === String(schemaMeta.metaSchemaUrl)
        );
    },
};
