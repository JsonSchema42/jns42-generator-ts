import { appendJsonPointer } from "../../utils/index.js";
import { SchemaNode } from "./node.js";

//#region core

export function selectNodeSchema(
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
            return node.$schema;
        }
    }
}

export function selectNodeId(
    node: SchemaNode,
) {
    if (
        typeof node === "object" &&
        node != null
    ) {
        if (
            "$id" in node &&
            typeof node.$id === "string"
        ) {
            return node.$id;
        }
    }
}

export function selectNodeAnchor(
    node: SchemaNode,
) {
    if (
        typeof node === "object" &&
        node != null
    ) {
        if (
            "$anchor" in node &&
            typeof node.$anchor === "string"
        ) {
            return node.$anchor;
        }
    }
}

export function selectNodeDynamicAnchor(
    node: SchemaNode,
) {
    if (
        typeof node === "object" &&
        node != null
    ) {
        if (
            "$dynamicAnchor" in node &&
            typeof node.$dynamicAnchor === "string"
        ) {
            return node.$dynamicAnchor;
        }
    }
}

export function selectNodeRef(
    node: SchemaNode,
) {
    if (
        typeof node === "object" &&
        node != null
    ) {
        if (
            "$ref" in node &&
            typeof node.$ref === "string"
        ) {
            return node.$ref;
        }
    }
}

export function selectNodeDynamicRef(
    node: SchemaNode,
) {
    if (
        typeof node === "object" &&
        node != null
    ) {
        if (
            "$dynamicRef" in node &&
            typeof node.$dynamicRef === "string"
        ) {
            return node.$dynamicRef;
        }
    }
}

//#endregion

//#region schema

export function* selectNodeDefEntries(
    nodePointer: string,
    node: SchemaNode,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "$defs" in node &&
            typeof node.$defs === "object" && node.$defs != null
        ) {
            for (const [key, subNode] of Object.entries(node.$defs)) {
                const subNodePointer = appendJsonPointer(nodePointer, "$defs", key);
                yield [subNodePointer, subNode] as const;
            }
        }
    }
}

export function* selectNodePropertyEntries(
    nodePointer: string,
    node: SchemaNode,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "properties" in node &&
            typeof node.properties === "object" && node.properties != null
        ) {
            for (const [key, subNode] of Object.entries(node.properties)) {
                const subNodePointer = appendJsonPointer(nodePointer, "properties", key);
                yield [subNodePointer, subNode] as const;
            }
        }
    }
}

export function* selectNodeAdditionalPropertyEntries(
    nodePointer: string,
    node: SchemaNode,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "additionalProperties" in node &&
            node.additionalProperties != null
        ) {
            const subNode = node.additionalProperties;
            const subNodePointer = appendJsonPointer(nodePointer, "additionalProperties");
            yield [subNodePointer, subNode] as const;
        }
    }
}

export function* selectNodePrefixItemEntries(
    nodePointer: string,
    node: SchemaNode,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "prefixItems" in node &&
            typeof node.prefixItems === "object" && node.prefixItems != null
        ) {
            for (const [key, subNode] of Object.entries(node.prefixItems)) {
                const subNodePointer = appendJsonPointer(nodePointer, "prefixItems", key);
                yield [subNodePointer, subNode] as const;
            }
        }
    }
}

export function* selectNodeItemEntries(
    nodePointer: string,
    node: SchemaNode,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "items" in node &&
            node.items != null
        ) {
            const subNode = node.items;
            const subNodePointer = appendJsonPointer(nodePointer, "items");
            yield [subNodePointer, subNode] as const;
        }
    }
}

export function* selectNodeAnyOfEntries(
    nodePointer: string,
    node: SchemaNode,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "anyOf" in node &&
            typeof node.anyOf === "object" && node.anyOf != null
        ) {
            for (const [key, subNode] of Object.entries(node.anyOf)) {
                const subNodePointer = appendJsonPointer(nodePointer, "anyOf", key);
                yield [subNodePointer, subNode] as const;
            }
        }
    }
}

export function* selectNodeOneOfEntries(
    nodePointer: string,
    node: SchemaNode,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "oneOf" in node &&
            typeof node.oneOf === "object" && node.oneOf != null
        ) {
            for (const [key, subNode] of Object.entries(node.oneOf)) {
                const subNodePointer = appendJsonPointer(nodePointer, "oneOf", key);
                yield [subNodePointer, subNode] as const;
            }
        }
    }
}

export function* selectNodeAllOfEntries(
    nodePointer: string,
    node: SchemaNode,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "allOf" in node &&
            typeof node.allOf === "object" && node.allOf != null
        ) {
            for (const [key, subNode] of Object.entries(node.allOf)) {
                const subNodePointer = appendJsonPointer(nodePointer, "allOf", key);
                yield [subNodePointer, subNode] as const;
            }
        }
    }
}

export function* selectNodeInstanceEntries(
    nodePointer: string,
    node: SchemaNode,
) {
    yield* selectNodeDefEntries(nodePointer, node);
    yield* selectNodePropertyEntries(nodePointer, node);
    yield* selectNodeAdditionalPropertyEntries(nodePointer, node);
    yield* selectNodePrefixItemEntries(nodePointer, node);
    yield* selectNodeItemEntries(nodePointer, node);
    yield* selectNodeAllOfEntries(nodePointer, node);
    yield* selectNodeAnyOfEntries(nodePointer, node);
    yield* selectNodeOneOfEntries(nodePointer, node);
}

//#endregion
