import { schemaMeta } from "./meta.js";

export type SchemaNode = unknown;

export function isSchemaRootNode(node: unknown): node is SchemaNode {
    return (
        typeof node === "object" &&
        node != null &&
        "$schema" in node &&
        node.$schema === schemaMeta.metaSchemaKey
    );
}
