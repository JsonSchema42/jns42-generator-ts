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

export function* selectNodeAdditionalPropertiesEntries(
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

export function* selectNodePrefixItemsEntries(
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

export function* selectNodeItemsEntries(
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
    yield* selectNodeAdditionalPropertiesEntries(nodePointer, node);
    yield* selectNodePrefixItemsEntries(nodePointer, node);
    yield* selectNodeItemsEntries(nodePointer, node);
    yield* selectNodeAllOfEntries(nodePointer, node);
    yield* selectNodeAnyOfEntries(nodePointer, node);
    yield* selectNodeOneOfEntries(nodePointer, node);
}

//#endregion

//#region type

export function selectNodeTypes(
    node: SchemaNode,
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

export function* selectNodeRequiredPropertyNames(
    node: SchemaNode,
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

export function* selectNodePropertyNamesEntries(
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
            for (const propertyName of Object.keys(node.properties)) {
                const subNodePointer = appendJsonPointer(nodePointer, "properties", propertyName);
                yield [subNodePointer, propertyName] as const;
            }
        }
    }
}

export function selectNodeEnum(
    node: SchemaNode,
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

export function selectNodeConst(
    node: SchemaNode,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "const" in node &&
            node.const != null
        ) {
            return node.const;
        }
    }
}

//#endregion

//#region validation

export function selectValidationMaxProperties(
    node: unknown,
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
    node: unknown,
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
    node: unknown,
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
    node: unknown,
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
    node: unknown,
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
    node: unknown,
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
    node: unknown,
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
    node: unknown,
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
    node: unknown,
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
    node: unknown,
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
    node: unknown,
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
    node: unknown,
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
    node: unknown,
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
    node: unknown,
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

export function selectValidationConst(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("const" in node) {
            return node.const;
        }
    }
}

export function selectValidationEnum(
    node: unknown,
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
