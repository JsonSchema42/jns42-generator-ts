import { appendJsonPointer } from "../../utils/index.js";
import { Schema } from "./types.js";

//#region core

export function selectNodeSchema(
    node: Schema,
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
    node: Schema,
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

export function selectNodeRef(
    node: Schema,
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

//#endregion

//#region schema

export function* selectNodeDefinitionsEntries(
    nodePointer: string,
    node: Schema,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "definitions" in node &&
            typeof node.definitions === "object" && node.definitions != null
        ) {
            for (const [key, subNode] of Object.entries(node.definitions)) {
                const subNodePointer = appendJsonPointer(nodePointer, "definitions", key);
                yield [subNodePointer, subNode] as const;
            }
        }
    }
}

export function* selectNodePropertyEntries(
    nodePointer: string,
    node: Schema,
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

export function* selectNodeAdditionalPropertiesEntries(
    nodePointer: string,
    node: Schema,
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

export function* selectNodeItemsOneEntries(
    nodePointer: string,
    node: Schema,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "items" in node &&
            typeof node.items === "object" && node.items != null &&
            !Array.isArray(node.items)

        ) {
            const subNode = node.items;
            const subNodePointer = appendJsonPointer(nodePointer, "items");
            yield [subNodePointer, subNode] as const;
        }
    }
}

export function* selectNodeItemsManyEntries(
    nodePointer: string,
    node: Schema,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "items" in node &&
            typeof node.items === "object" && node.items != null &&
            Array.isArray(node.items)
        ) {
            for (const [key, subNode] of Object.entries(node.items)) {
                const subNodePointer = appendJsonPointer(nodePointer, "items", key);
                yield [subNodePointer, subNode] as const;
            }
        }
    }
}

export function* selectNodeAdditionalItemsEntries(
    nodePointer: string,
    node: Schema,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "additionalItems" in node &&
            node.additionalItems != null
        ) {
            const subNode = node.additionalItems;
            const subNodePointer = appendJsonPointer(nodePointer, "additionalItems");
            yield [subNodePointer, subNode] as const;
        }
    }
}

export function* selectNodeAnyOfEntries(
    nodePointer: string,
    node: Schema,
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
    node: Schema,
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
    node: Schema,
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
    node: Schema,
) {
    yield* selectNodeDefinitionsEntries(nodePointer, node);
    yield* selectNodePropertyEntries(nodePointer, node);
    yield* selectNodeAdditionalPropertiesEntries(nodePointer, node);
    yield* selectNodeItemsOneEntries(nodePointer, node);
    yield* selectNodeItemsManyEntries(nodePointer, node);
    yield* selectNodeAdditionalItemsEntries(nodePointer, node);
    yield* selectNodeAllOfEntries(nodePointer, node);
    yield* selectNodeAnyOfEntries(nodePointer, node);
    yield* selectNodeOneOfEntries(nodePointer, node);
}

//#endregion

//#region type

export function selectNodeType(
    node: Schema,
) {
    if (
        typeof node === "object" &&
        node != null
    ) {
        if (
            "type" in node &&
            typeof node.type === "string"
        ) {
            return [node.type];
        }
        else if (
            "type" in node &&
            Array.isArray(node.type) &&
            node.type.every(type => typeof type === "string")
        ) {
            return node.type as string[];
        }
    }
}

export function* selectNodeRequiredProperties(
    node: Schema,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "required" in node &&
            Array.isArray(node.required) &&
            node.required.every(type => typeof type === "string")
        ) {
            yield* node.required as string[];
        }
    }
}

export function* selectNodeProperties(
    nodePointer: string,
    node: Schema,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "properties" in node &&
            typeof node.properties === "object" && node.properties != null
        ) {
            for (const [key] of Object.entries(node.properties)) {
                const subNodePointer = appendJsonPointer(nodePointer, "properties", key);
                yield [key, subNodePointer] as const;
            }
        }
    }
}

export function selectNodeEnum(
    node: Schema,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "enum" in node &&
            node.enum != null &&
            Array.isArray(node.enum)
        ) {
            return node.enum;
        }
    }
}

//#endregion

//#region validation

export function selectValidationMaxProperties(
    node: Schema,
) {
    if (node != null && typeof node === "object") {
        if (
            "maxProperties" in node &&
            typeof node.maxProperties === "number"
        ) {
            return node.maxProperties;
        }
    }
}

export function selectValidationMinProperties(
    node: Schema,
) {
    if (node != null && typeof node === "object") {
        if (
            "minProperties" in node &&
            typeof node.minProperties === "number"
        ) {
            return node.minProperties;
        }
    }
}

export function selectValidationRequired(
    node: Schema,
) {
    if (node != null && typeof node === "object") {
        if (
            "required" in node &&
            Array.isArray(node.required) &&
            node.required.every(value => typeof value === "string")
        ) {
            return node.required as string[];
        }
    }
}

export function selectValidationMinItems(
    node: Schema,
) {
    if (node != null && typeof node === "object") {
        if (
            "minItems" in node &&
            typeof node.minItems === "number"

        ) {
            return node.minItems;
        }
    }
}

export function selectValidationMaxItems(
    node: Schema,
) {
    if (node != null && typeof node === "object") {
        if (
            "maxItems" in node &&
            typeof node.maxItems === "number"
        ) {
            return node.maxItems;
        }
    }
}

export function selectValidationUniqueItems(
    node: Schema,
) {
    if (node != null && typeof node === "object") {
        if (
            "uniqueItems" in node &&
            typeof node.uniqueItems === "boolean"
        ) {
            return node.uniqueItems;
        }
    }
}

export function selectValidationMinLength(
    node: Schema,
) {
    if (node != null && typeof node === "object") {
        if (
            "minLength" in node &&
            typeof node.minLength === "number"
        ) {
            return node.minLength;
        }
    }
}

export function selectValidationMaxLength(
    node: Schema,
) {
    if (node != null && typeof node === "object") {
        if (
            "maxLength" in node &&
            typeof node.maxLength === "number"
        ) {
            return node.maxLength;
        }
    }
}

export function selectValidationPattern(
    node: Schema,
) {
    if (node != null && typeof node === "object") {
        if (
            "pattern" in node &&
            typeof node.pattern === "string"
        ) {
            return node.pattern;
        }
    }
}

export function selectValidationMinimum(
    node: Schema,
) {
    if (node != null && typeof node === "object") {
        if (
            "minimum" in node &&
            typeof node.minimum === "number"
        ) {
            return node.minimum;
        }
    }
}

export function selectValidationExclusiveMinimum(
    node: Schema,
) {
    if (node != null && typeof node === "object") {
        if (
            "exclusiveMinimum" in node &&
            typeof node.exclusiveMinimum === "number"
        ) {
            return node.exclusiveMinimum;
        }
    }
}

export function selectValidationMaximum(
    node: Schema,
) {
    if (node != null && typeof node === "object") {
        if (
            "maximum" in node &&
            typeof node.maximum === "number"
        ) {
            return node.maximum;
        }
    }
}

export function selectValidationExclusiveMaximum(
    node: Schema,
) {
    if (node != null && typeof node === "object") {
        if (
            "exclusiveMaximum" in node &&
            typeof node.exclusiveMaximum === "number"
        ) {
            return node.exclusiveMaximum;
        }
    }
}

export function selectValidationMultipleOf(
    node: Schema,
) {
    if (node != null && typeof node === "object") {
        if (
            "multipleOf" in node &&
            typeof node.multipleOf === "number"
        ) {
            return node.multipleOf;
        }
    }
}

export function selectValidationEnum(
    node: Schema,
) {
    if (node != null && typeof node === "object") {
        if (
            "enum" in node &&
            Array.isArray(node.enum)
        ) {
            return node.enum;
        }
    }
}

//#endregion
