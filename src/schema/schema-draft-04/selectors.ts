import { appendJsonPointer } from "../../utils/index.js";
import { Schema } from "./types.js";

//#region core

export function selectNodeSchema(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.$schema;
    }
}

export function selectNodeId(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.id;
    }
}

export function selectNodeRef(
    node: Schema | boolean,
) {
    // $ref is not in the schema
    if (typeof node === "object" && "$ref" in node && typeof node.$ref === "string") {
        return node.$ref;
    }
}

//#endregion

//#region schema

export function* selectNodeDefinitionsEntries(
    nodePointer: string,
    node: Schema | boolean,
) {
    if (typeof node === "object" && node.definitions != null) {
        for (const [key, subNode] of Object.entries(node.definitions)) {
            const subNodePointer = appendJsonPointer(nodePointer, "definitions", key);
            yield [subNodePointer, subNode] as const;
        }
    }
}

export function* selectNodePropertyEntries(
    nodePointer: string,
    node: Schema | boolean,
) {
    if (typeof node === "object" && node.properties != null) {
        for (const [key, subNode] of Object.entries(node.properties)) {
            const subNodePointer = appendJsonPointer(nodePointer, "properties", key);
            yield [subNodePointer, subNode] as const;
        }
    }
}

export function* selectNodeAdditionalPropertiesEntries(
    nodePointer: string,
    node: Schema | boolean,
) {
    if (typeof node === "object" && node.additionalProperties != null) {
        const subNode = node.additionalProperties;
        const subNodePointer = appendJsonPointer(nodePointer, "additionalProperties");
        yield [subNodePointer, subNode] as const;
    }
}

export function* selectNodeItemsOneEntries(
    nodePointer: string,
    node: Schema | boolean,
) {
    if (typeof node === "object" && node.items != null && !Array.isArray(node.items)) {
        const subNode = node.items;
        const subNodePointer = appendJsonPointer(nodePointer, "items");
        yield [subNodePointer, subNode] as const;
    }
}

export function* selectNodeItemsManyEntries(
    nodePointer: string,
    node: Schema | boolean,
) {
    if (typeof node === "object" && node.items != null && Array.isArray(node.items)
    ) {
        for (const [key, subNode] of Object.entries(node.items)) {
            const subNodePointer = appendJsonPointer(nodePointer, "items", key);
            yield [subNodePointer, subNode] as [string, Schema];
        }
    }
}

export function* selectNodeAdditionalItemsEntries(
    nodePointer: string,
    node: Schema | boolean,
) {
    if (typeof node === "object" && node.additionalItems != null) {
        const subNode = node.additionalItems;
        const subNodePointer = appendJsonPointer(nodePointer, "additionalItems");
        yield [subNodePointer, subNode] as const;
    }
}

export function* selectNodeAnyOfEntries(
    nodePointer: string,
    node: Schema | boolean,
) {
    if (typeof node === "object" && node.anyOf != null) {
        for (const [key, subNode] of Object.entries(node.anyOf)) {
            const subNodePointer = appendJsonPointer(nodePointer, "anyOf", key);
            yield [subNodePointer, subNode] as [string, Schema];
        }
    }
}

export function* selectNodeOneOfEntries(
    nodePointer: string,
    node: Schema | boolean,
) {
    if (typeof node === "object" && node.oneOf != null) {
        for (const [key, subNode] of Object.entries(node.oneOf)) {
            const subNodePointer = appendJsonPointer(nodePointer, "oneOf", key);
            yield [subNodePointer, subNode] as [string, Schema];
        }
    }
}

export function* selectNodeAllOfEntries(
    nodePointer: string,
    node: Schema | boolean,
) {
    if (typeof node === "object" && node.allOf != null) {
        for (const [key, subNode] of Object.entries(node.allOf)) {
            const subNodePointer = appendJsonPointer(nodePointer, "allOf", key);
            yield [subNodePointer, subNode] as [string, Schema];
        }
    }
}

export function* selectNodeInstanceEntries(
    nodePointer: string,
    node: Schema | boolean,
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

export function selectNodeTypes(
    node: Schema | boolean,
) {
    if (typeof node === "object" && node.type != null) {
        if (Array.isArray(node.type)) {
            return node.type;
        }
        else {
            return [node.type];
        }
    }
}

export function* selectNodeRequiredProperties(
    node: Schema | boolean,
) {
    if (typeof node === "object" && node.required != null) {
        yield* node.required;
    }
}

export function* selectNodeProperties(
    nodePointer: string,
    node: Schema | boolean,
) {
    if (typeof node === "object" && node.properties != null) {
        for (const [key] of Object.entries(node.properties)) {
            const subNodePointer = appendJsonPointer(nodePointer, "properties", key);
            yield [key, subNodePointer] as const;
        }
    }
}

export function selectNodeEnum(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.enum;
    }
}

//#endregion

//#region validation

export function selectValidationMaxProperties(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.maxProperties;
    }
}

export function selectValidationMinProperties(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.minProperties;
    }
}

export function selectValidationRequired(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.required as string[];
    }
}

export function selectValidationMinItems(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.minItems;
    }
}

export function selectValidationMaxItems(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.maxItems;
    }
}

export function selectValidationUniqueItems(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.uniqueItems;
    }
}

export function selectValidationMinLength(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.minLength;
    }
}

export function selectValidationMaxLength(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.maxLength;
    }
}

export function selectValidationPattern(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.pattern;
    }
}

export function selectValidationMinimum(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.minimum;
    }
}

export function selectValidationExclusiveMinimum(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.exclusiveMinimum;
    }
}

export function selectValidationMaximum(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.maximum;
    }
}

export function selectValidationExclusiveMaximum(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.exclusiveMaximum;
    }
}

export function selectValidationMultipleOf(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.multipleOf;
    }
}

export function selectValidationEnum(
    node: Schema | boolean,
) {
    if (typeof node === "object") {
        return node.enum;
    }
}

//#endregion
