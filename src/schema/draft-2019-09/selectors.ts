import { appendJsonPointer } from "../../utils/index.js";
import { Applicator, Core, Metadata, Validation } from "./types.js";

//#region core

export function selectNodeSchema(
    node: Core,
) {
    if (typeof node === "object") {
        return node.$schema;
    }
}

export function selectNodeId(
    node: Core,
) {
    if (typeof node === "object") {
        return node.$id;
    }
}

export function selectNodeAnchor(
    node: Core,
) {
    if (typeof node === "object") {
        return node.$anchor;
    }
}

export function selectNodeRecursiveAnchor(
    node: Core,
) {
    if (typeof node === "object") {
        return node.$recursiveAnchor;
    }
}

export function selectNodeRef(
    node: Core,
) {
    if (typeof node === "object") {
        return node.$ref;
    }
}

export function selectNodeRecursiveRef(
    node: Core,
) {
    if (typeof node === "object") {
        return node.$recursiveRef;
    }
}

export function selectNodeDescription(
    node: Metadata,
) {
    if (typeof node === "object") {
        return node.description;
    }
}

export function selectNodeDeprecated(
    node: Metadata,
) {
    if (typeof node === "object") {
        return node.deprecated;
    }
}

//#endregion

//#region schema

export function* selectNodeDefEntries(
    nodePointer: string,
    node: Core,
) {
    if (typeof node === "object" && node.$defs != null) {
        for (const [key, subNode] of Object.entries(node.$defs)) {
            const subNodePointer = appendJsonPointer(nodePointer, "$defs", key);
            yield [subNodePointer, subNode] as const;
        }
    }
}

export function* selectNodePropertyEntries(
    nodePointer: string,
    node: Applicator,
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
    node: Applicator,
) {
    if (typeof node === "object" && node.additionalProperties != null) {
        const subNode = node.additionalProperties;
        const subNodePointer = appendJsonPointer(nodePointer, "additionalProperties");
        yield [subNodePointer, subNode] as const;
    }
}

export function* selectNodeItemsOneEntries(
    nodePointer: string,
    node: Applicator,
) {
    if (typeof node === "object" && node.items != null && !Array.isArray(node.items)) {
        const subNode = node.items;
        const subNodePointer = appendJsonPointer(nodePointer, "items");
        yield [subNodePointer, subNode] as const;
    }
}

export function* selectNodeItemsManyEntries(
    nodePointer: string,
    node: Applicator,
) {
    if (typeof node === "object" && node.items != null && Array.isArray(node.items)) {
        for (const [key, subNode] of Object.entries(node.items)) {
            const subNodePointer = appendJsonPointer(nodePointer, "items", key);
            yield [subNodePointer, subNode] as const;
        }
    }
}

export function* selectNodeAdditionalItemsEntries(
    nodePointer: string,
    node: Applicator,
) {
    if (typeof node === "object" && node.additionalItems) {
        const subNode = node.additionalItems;
        const subNodePointer = appendJsonPointer(nodePointer, "additionalItems");
        yield [subNodePointer, subNode] as const;
    }
}

export function* selectNodeAnyOfEntries(
    nodePointer: string,
    node: Applicator,
) {
    if (typeof node === "object" && node.anyOf) {
        for (const [key, subNode] of Object.entries(node.anyOf)) {
            const subNodePointer = appendJsonPointer(nodePointer, "anyOf", key);
            yield [subNodePointer, subNode] as const;
        }
    }
}

export function* selectNodeOneOfEntries(
    nodePointer: string,
    node: Applicator,
) {
    if (typeof node === "object" && node.oneOf) {
        for (const [key, subNode] of Object.entries(node.oneOf)) {
            const subNodePointer = appendJsonPointer(nodePointer, "oneOf", key);
            yield [subNodePointer, subNode] as const;
        }
    }
}

export function* selectNodeAllOfEntries(
    nodePointer: string,
    node: Applicator,
) {
    if (typeof node === "object" && node.allOf) {
        for (const [key, subNode] of Object.entries(node.allOf)) {
            const subNodePointer = appendJsonPointer(nodePointer, "allOf", key);
            yield [subNodePointer, subNode] as const;
        }
    }
}

export function* selectNodeInstanceEntries(
    nodePointer: string,
    node: Applicator & Core,
) {
    yield* selectNodeDefEntries(nodePointer, node);
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
    node: Validation,
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

export function* selectNodeRequiredPropertyNames(
    node: Validation,
) {
    if (typeof node === "object" && node.required != null) {
        yield* node.required;
    }
}

export function* selectNodePropertyNamesEntries(
    nodePointer: string,
    node: Applicator,
) {
    if (typeof node === "object" && node.properties != null) {
        for (const propertyName of Object.keys(node.properties)) {
            const subNodePointer = appendJsonPointer(nodePointer, "properties", propertyName);
            yield [subNodePointer, propertyName] as const;
        }
    }
}

export function selectNodeEnum(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.enum;
    }
}

export function selectNodeConst(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.const;
    }
}

//#endregion

//#region validation

export function selectValidationMaxProperties(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.maxProperties;
    }
}

export function selectValidationMinProperties(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.minProperties;
    }
}

export function selectValidationRequired(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.required as string[];
    }
}

export function selectValidationMinItems(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.minItems;
    }
}

export function selectValidationMaxItems(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.maxItems;
    }
}

export function selectValidationUniqueItems(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.uniqueItems;
    }
}

export function selectValidationMinLength(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.minLength;
    }
}

export function selectValidationMaxLength(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.maxLength;
    }
}

export function selectValidationPattern(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.pattern;
    }
}

export function selectValidationMinimum(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.minimum;
    }
}

export function selectValidationExclusiveMinimum(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.exclusiveMinimum;
    }
}

export function selectValidationMaximum(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.maximum;
    }
}

export function selectValidationExclusiveMaximum(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.exclusiveMaximum;
    }
}

export function selectValidationMultipleOf(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.multipleOf;
    }
}

export function selectValidationConst(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.const;
    }
}

export function selectValidationEnum(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.enum;
    }
}

//#endregion
