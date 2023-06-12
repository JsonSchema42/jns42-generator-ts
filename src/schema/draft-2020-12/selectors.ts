import { Applicator, Core, MetaData, Validation } from "@jns42/jns42-schema-draft-2020-12";

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

export function selectNodeDynamicAnchor(
    node: Core,
) {
    if (typeof node === "object") {
        return node.$dynamicAnchor;
    }
}

export function selectNodeRef(
    node: Core,
) {
    if (typeof node === "object") {
        return node.$ref;
    }
}

export function selectNodeDynamicRef(
    node: Core,
) {
    if (typeof node === "object") {
        return node.$dynamicRef;
    }
}

//#endregion

//#region metadata

export function selectNodeDescription(
    node: MetaData,
) {
    if (typeof node === "object") {
        return node.description;
    }
}

export function selectNodeDeprecated(
    node: MetaData,
) {
    if (typeof node === "object") {
        return node.deprecated;
    }
}

export function selectNodeExamples(
    node: MetaData,
) {
    if (typeof node === "object") {
        return node.examples;
    }
}

//#endregion

//#region schema

export function* selectSubNodeDefEntries(
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

export function* selectSubNodePropertyEntries(
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

export function* selectSubNodeAdditionalPropertiesEntries(
    nodePointer: string,
    node: Applicator,
) {
    if (typeof node === "object" && node.additionalProperties != null) {
        const subNode = node.additionalProperties;
        const subNodePointer = appendJsonPointer(nodePointer, "additionalProperties");
        yield [subNodePointer, subNode] as const;
    }
}

export function* selectSubNodePrefixItemsEntries(
    nodePointer: string,
    node: Applicator,
) {
    if (typeof node === "object" && node.prefixItems != null) {
        for (const [key, subNode] of Object.entries(node.prefixItems)) {
            const subNodePointer = appendJsonPointer(nodePointer, "prefixItems", key);
            yield [subNodePointer, subNode] as const;
        }
    }
}

export function* selectSubNodeItemsEntries(
    nodePointer: string,
    node: Applicator,
) {
    if (typeof node === "object" && node.items != null) {
        const subNode = node.items;
        const subNodePointer = appendJsonPointer(nodePointer, "items");
        yield [subNodePointer, subNode] as const;
    }
}

export function* selectSubNodeAnyOfEntries(
    nodePointer: string,
    node: Applicator,
) {
    if (typeof node === "object" && node.anyOf != null) {
        for (const [key, subNode] of Object.entries(node.anyOf)) {
            const subNodePointer = appendJsonPointer(nodePointer, "anyOf", key);
            yield [subNodePointer, subNode] as const;

        }
    }
}

export function* selectSubNodeOneOfEntries(
    nodePointer: string,
    node: Applicator,
) {
    if (typeof node === "object" && node.oneOf != null) {
        for (const [key, subNode] of Object.entries(node.oneOf)) {
            const subNodePointer = appendJsonPointer(nodePointer, "oneOf", key);
            yield [subNodePointer, subNode] as const;
        }
    }
}

export function* selectSubNodeAllOfEntries(
    nodePointer: string,
    node: Applicator,
) {
    if (typeof node === "object" && node.allOf != null) {
        for (const [key, subNode] of Object.entries(node.allOf)) {
            const subNodePointer = appendJsonPointer(nodePointer, "allOf", key);
            yield [subNodePointer, subNode] as const;
        }
    }
}

export function* selectSubNodes(
    nodePointer: string,
    node: Applicator & Core,
): Iterable<readonly [string, Applicator & Core]> {
    yield* selectSubNodeDefEntries(nodePointer, node);
    yield* selectSubNodePropertyEntries(nodePointer, node);
    yield* selectSubNodeAdditionalPropertiesEntries(nodePointer, node);
    yield* selectSubNodePrefixItemsEntries(nodePointer, node);
    yield* selectSubNodeItemsEntries(nodePointer, node);
    yield* selectSubNodeAllOfEntries(nodePointer, node);
    yield* selectSubNodeAnyOfEntries(nodePointer, node);
    yield* selectSubNodeOneOfEntries(nodePointer, node);
}

export function* selectAllSubNodes(
    nodePointer: string,
    node: Applicator & Core,
): Iterable<readonly [string, Applicator & Core]> {
    const subNodes = [...selectSubNodes(nodePointer, node)];
    yield* subNodes;
    for (const [subPointer, subNode] of subNodes) {
        yield* selectAllSubNodes(subPointer, subNode);
    }
}

export function* selectAllSubNodesAndSelf(
    nodePointer: string,
    node: Applicator & Core,
): Iterable<readonly [string, Applicator & Core]> {
    yield [nodePointer, node] as const;
    yield* selectAllSubNodes(nodePointer, node);
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

export function selectValidationMaximumProperties(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.maxProperties;
    }
}

export function selectValidationMinimumProperties(
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
        return node.required;
    }
}

export function selectValidationMinimumItems(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.minItems;
    }
}

export function selectValidationMaximumItems(
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

export function selectValidationMinimumLength(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.minLength;
    }
}

export function selectValidationMaximumLength(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.maxLength;
    }
}

export function selectValidationValuePattern(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.pattern;
    }
}

export function selectValidationMinimumInclusive(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.minimum;
    }
}

export function selectValidationMinimumExclusive(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.exclusiveMinimum;
    }
}

export function selectValidationMaximumInclusive(
    node: Validation,
) {
    if (typeof node === "object") {
        return node.maximum;
    }
}

export function selectValidationMaximumExclusive(
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

//#region helpers

function appendJsonPointer(basePointer: string, ...subPointerParts: string[]) {
    return basePointer + subPointerParts.
        map(part => "/" + encodeURI(part)).
        join("");
}

//#endregion
