import { createString, flattenObject, pointerToHash, simpleTypes } from "../../utils/index.js";
import { SchemaExampleGeneratorBase } from "../example-generator.js";
import { SchemaManager } from "../manager.js";
import { SchemaIndexer } from "./indexer.js";
import { SchemaLoader } from "./loader.js";
import { SchemaNode } from "./node.js";
import { selectNodeDynamicRef, selectNodeItemsEntries, selectNodePropertyEntries, selectNodePropertyNamesEntries, selectNodeRef, selectNodeRequiredPropertyNames, selectNodeTypes, selectValidationExclusiveMaximum, selectValidationExclusiveMinimum, selectValidationMaximum, selectValidationMaxLength, selectValidationMinimum, selectValidationMinLength, selectValidationMultipleOf, selectValidationPattern } from "./selectors.js";

export class SchemaExampleGenerator extends SchemaExampleGeneratorBase {
    public refDepthLimit = 3;

    constructor(
        manager: SchemaManager,
        private readonly loader: SchemaLoader,
        private readonly indexer: SchemaIndexer,
    ) {
        super(manager);
    }

    public *generateExamplesFromUrl(
        nodeUrl: URL,
        wantErrors: number,
    ): Iterable<unknown> {
        for (const [errors, example] of this.generateFromUrl(
            nodeUrl,
            wantErrors,
            0,
        )) {
            if (errors !== wantErrors) {
                continue;
            }
            yield example;
        }
    }

    public *generateFromUrl(
        nodeUrl: URL,
        errorLimit: number,
        refDepth: number,
    ): Iterable<[number, unknown]> {
        const nodeId = String(nodeUrl);

        const item = this.indexer.getNodeItem(nodeId);
        if (item == null) {
            throw new Error("item not found");
        }

        yield* filterErrorLimit(this.generateFromNode(
            item.node,
            nodeUrl,
            "",
            errorLimit,
            refDepth,
        ), errorLimit);
    }

    private *generateFromNode(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        errorLimit: number,
        refDepth: number,
    ): Iterable<[number, unknown]> {
        const nodeId = String(nodeUrl);
        const nodeItem = this.indexer.getNodeItem(nodeId);
        if (!nodeItem) {
            throw new Error("node item nod found");
        }

        const nodeRef = selectNodeRef(nodeItem.node);
        if (nodeRef != null) {
            const resolvedNodeId = this.indexer.resolveReferenceNodeId(
                nodeId,
                nodeRef,
            );
            const resolvedNodeUrl = new URL(resolvedNodeId);

            if (refDepth < this.refDepthLimit) {
                yield* filterErrorLimit(this.generateFromUrl(
                    resolvedNodeUrl,
                    errorLimit,
                    refDepth + 1,
                ), errorLimit);
            }
        }

        const nodeDynamicRef = selectNodeDynamicRef(nodeItem.node);
        if (nodeDynamicRef != null) {
            const resolvedNodeId = this.indexer.resolveDynamicReferenceNodeId(
                nodeId,
                nodeDynamicRef,
            );
            const resolvedNodeUrl = new URL(resolvedNodeId);

            if (refDepth < this.refDepthLimit) {
                yield* filterErrorLimit(this.generateFromUrl(
                    resolvedNodeUrl,
                    errorLimit,
                    refDepth + 1,
                ), errorLimit);
            }
        }

        const nodeTypes = selectNodeTypes(node);
        if (nodeTypes != null) {
            yield* filterErrorLimit(this.generateForTypes(
                nodeTypes,
                node,
                nodeUrl,
                nodePointer,
                errorLimit,
                refDepth,
            ), errorLimit);
        }
    }

    private *generateForTypes(
        types: string[],
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        errorLimit: number,
        refDepth: number,
    ): Iterable<[number, unknown]> {
        const typeSet = new Set(types);

        for (const type of simpleTypes) {
            if (typeSet.has(type)) {
                yield* filterErrorLimit(this.generateForType(
                    type,
                    node,
                    nodeUrl,
                    nodePointer,
                    errorLimit,
                    refDepth,
                ), errorLimit);
            }
            else {
                switch (type) {
                    case "null":
                        yield [1, null];
                        break;

                    case "array":
                        yield [1, []];
                        break;

                    case "object":
                        yield [1, {}];
                        break;

                    case "string":
                        yield [1, "fail!!"];
                        break;

                    case "number":
                        yield [1, 10.1];
                        break;

                    case "integer":
                        yield [1, 10];
                        break;

                    case "boolean":
                        yield [1, true];
                        yield [1, false];
                        break;
                }
            }
        }
    }

    private * generateForType(
        type: string,
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        errorLimit: number,
        refDepth: number,
    ): Iterable<[number, unknown]> {
        switch (type) {
            case "null":
                yield* filterErrorLimit(this.generateForNull(
                    node,
                    nodeUrl,
                    nodePointer,
                ), errorLimit);
                break;

            case "array":
                yield* filterErrorLimit(this.generateForArray(
                    node,
                    nodeUrl,
                    nodePointer,
                    refDepth,
                    errorLimit,
                ), errorLimit);
                break;

            case "object":
                yield* filterErrorLimit(this.generateForObject(
                    node,
                    nodeUrl,
                    nodePointer,
                    refDepth,
                    errorLimit,
                ), errorLimit);
                break;

            case "string":
                yield* filterErrorLimit(this.generateForString(
                    node,
                    nodeUrl,
                    nodePointer,
                ), errorLimit);
                break;

            case "number":
                yield* filterErrorLimit(this.generateForNumber(
                    node,
                    nodeUrl,
                    nodePointer,
                ), errorLimit);
                break;

            case "integer":
                yield* filterErrorLimit(this.generateForInteger(
                    node,
                    nodeUrl,
                    nodePointer,
                ), errorLimit);
                break;

            case "boolean":
                yield* filterErrorLimit(this.generateForBoolean(
                    node,
                    nodeUrl,
                    nodePointer,
                ), errorLimit);
                break;

            default:
                throw new Error("type not supported");

        }
    }

    private * generateForNull(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ): Iterable<[number, unknown]> {
        yield [0, null];
    }

    private * generateForArray(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        errorLimit: number,
        refDepth: number,
    ): Iterable<[number, unknown]> {
        const itemsEntries = selectNodeItemsEntries(nodePointer, node);

        for (const [subNodePointer, subNode] of itemsEntries) {
            const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeUrl);

            for (const [errors, example] of this.generateFromNode(
                subNode,
                subNodeUrl,
                subNodePointer,
                errorLimit,
                refDepth,
            )) {
                yield [errors, [example]];
            }
        }
    }

    private * generateForObject(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        errorLimit: number,
        refDepth: number,
    ): Iterable<[number, unknown]> {
        const propertyNameEntries = [...selectNodePropertyNamesEntries(nodePointer, node)];
        const propertyNameMap = Object.fromEntries(propertyNameEntries);
        const propertyEntries = [...selectNodePropertyEntries(nodePointer, node)];
        const requiredPropertyNames = new Set(selectNodeRequiredPropertyNames(node));

        {
            /*
            only yield properties that are not required
            */
            const subExamples: Record<string, Array<[number, unknown]>> = {};

            for (const [subNodePointer, subNode] of propertyEntries) {
                // eslint-disable-next-line security/detect-object-injection
                const propertyName = propertyNameMap[subNodePointer];
                if (requiredPropertyNames.has(propertyName)) {
                    continue;
                }

                const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeUrl);

                // eslint-disable-next-line security/detect-object-injection
                subExamples[propertyName] = [...filterErrorLimit(this.generateFromNode(
                    subNode,
                    subNodeUrl,
                    subNodePointer,
                    errorLimit,
                    refDepth,
                ), errorLimit)];
            }

            for (const flattened of flattenObject(subExamples)) {
                const errors = Object.values(flattened).
                    filter(value => value != null).
                    reduce((sum, [errors]) => sum + errors, 0);
                const example = Object.fromEntries(
                    Object.entries(flattened).
                        filter(([, value]) => value != null).
                        map(([key, [, value]]) => [key, value]),
                );
                yield [errors + 1, example];
            }
        }

        /*
        only yield all properties that are required
        */
        {
            const subExamples: Record<string, Array<[number, unknown]>> = {};

            for (const [subNodePointer, subNode] of propertyEntries) {
                // eslint-disable-next-line security/detect-object-injection
                const propertyName = propertyNameMap[subNodePointer];
                if (!requiredPropertyNames.has(propertyName)) {
                    continue;
                }
                const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeUrl);

                // eslint-disable-next-line security/detect-object-injection
                subExamples[propertyName] = [...filterErrorLimit(this.generateFromNode(
                    subNode,
                    subNodeUrl,
                    subNodePointer,
                    errorLimit,
                    refDepth,
                ), errorLimit)];
            }

            for (const flattened of flattenObject(subExamples)) {
                const errors = Object.values(flattened).
                    filter(value => value != null).
                    reduce((sum, [errors]) => sum + errors, 0);
                const example = Object.fromEntries(
                    Object.entries(flattened).
                        filter(([, value]) => value != null).
                        map(([key, [, value]]) => [key, value]),
                );
                yield [errors, example];
            }
        }

        /*
        yield all properties
        */
        {
            const subExamples: Record<string, Array<[number, unknown]>> = {};

            for (const [subNodePointer, subNode] of propertyEntries) {
                // eslint-disable-next-line security/detect-object-injection
                const propertyName = propertyNameMap[subNodePointer];
                const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeUrl);

                // eslint-disable-next-line security/detect-object-injection
                subExamples[propertyName] = [...filterErrorLimit(this.generateFromNode(
                    subNode,
                    subNodeUrl,
                    subNodePointer,
                    errorLimit,
                    refDepth,
                ), errorLimit)];
            }

            for (const flattened of flattenObject(subExamples)) {
                const errors = Object.values(flattened).
                    filter(value => value != null).
                    reduce((sum, [errors]) => sum + errors, 0);
                const example = Object.fromEntries(
                    Object.entries(flattened).
                        filter(([, value]) => value != null).
                        map(([key, [, value]]) => [key, value]),
                );
                yield [errors, example];
            }
        }

    }

    private * generateForString(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ): Iterable<[number, unknown]> {
        const minLength = selectValidationMinLength(node);
        const maxLength = selectValidationMaxLength(node);
        const pattern = selectValidationPattern(node);

        if (minLength != null) {
            yield [1, createString(minLength - 1)];
        }
        if (maxLength != null) {
            yield [1, createString(maxLength + 1)];
        }
        if (pattern != null) {
            throw new Error("not implemented");
        }

        // TODO robust implementation
        const minLengthOrDefault = minLength ?? 5;
        const maxLengthOrDefault = maxLength ?? 10;

        yield [
            0,
            createString(
                Math.round(minLengthOrDefault + (maxLengthOrDefault - minLengthOrDefault) / 2),
            ),
        ];
    }

    private * generateForNumber(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ): Iterable<[number, unknown]> {
        const minimum = selectValidationMinimum(node);
        const exclusiveMinimum = selectValidationExclusiveMinimum(node);
        const maximum = selectValidationMaximum(node);
        const exclusiveMaximum = selectValidationExclusiveMaximum(node);
        const multipleOf = selectValidationMultipleOf(node);

        if (minimum != null) {
            yield [1, minimum - 1];
        }
        if (exclusiveMinimum != null) {
            yield [1, exclusiveMinimum];
        }
        if (maximum != null) {
            yield [1, maximum + 1];
        }
        if (exclusiveMaximum != null) {
            yield [1, exclusiveMaximum];
        }
        if (multipleOf != null) {
            throw new Error("not implemented");
        }

        // TODO robust implementation
        const minValueOrDefault = minimum ?? exclusiveMinimum ?? -1000;
        const maxValueOrDefault = maximum ?? exclusiveMaximum ?? +1000;

        yield [
            0,
            minValueOrDefault + (maxValueOrDefault - minValueOrDefault),
        ];
    }

    private * generateForInteger(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ): Iterable<[number, unknown]> {
        const minimum = selectValidationMinimum(node);
        const exclusiveMinimum = selectValidationExclusiveMinimum(node);
        const maximum = selectValidationMaximum(node);
        const exclusiveMaximum = selectValidationExclusiveMaximum(node);
        const multipleOf = selectValidationMultipleOf(node);

        if (minimum != null) {
            yield [1, minimum - 1];
        }
        if (exclusiveMinimum != null) {
            yield [1, exclusiveMinimum];
        }
        if (maximum != null) {
            yield [1, maximum + 1];
        }
        if (exclusiveMaximum != null) {
            yield [1, exclusiveMaximum];
        }
        if (multipleOf != null) {
            throw new Error("not implemented");
        }

        // TODO robust implementation
        const minValueOrDefault = minimum ?? exclusiveMinimum ?? -1000;
        const maxValueOrDefault = maximum ?? exclusiveMaximum ?? +1000;

        yield [
            0,
            Math.round(minValueOrDefault + (maxValueOrDefault - minValueOrDefault)),
        ];
    }

    private * generateForBoolean(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ): Iterable<[number, unknown]> {
        yield [0, true];
        yield [0, false];
    }

}

function* filterErrorLimit(
    iterable: Iterable<[number, unknown]>,
    errorLimit: number,
): Iterable<[number, unknown]> {
    for (const element of iterable) {
        const [error] = element;
        if (error > errorLimit) {
            continue;
        }

        yield element;
    }
}