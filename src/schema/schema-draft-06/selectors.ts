import { SchemaNode } from "./node.js";

//#region core

export function selectNodeSchemaUrl(
    node: SchemaNode,
) {
    if (
        typeof node === "object" &&
        node != null
    ) {
        if (
            "$schema" in node &&
            typeof node.$schema === "string"
        ) {
            return new URL(node.$schema);
        }
    }
}

//#endregion
