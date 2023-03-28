import { createString, flattenObject } from "../../utils/index.js";
import { SchemaExampleGeneratorBase } from "../example-generator.js";
import { SchemaManager } from "../manager.js";
import { SchemaIndexer } from "./indexer.js";
import { selectNodeDynamicRef, selectNodeItemsEntries, selectNodePropertyEntries, selectNodePropertyNamesEntries, selectNodeRef, selectNodeRequiredPropertyNames, selectNodeTypes, selectValidationExclusiveMaximum, selectValidationExclusiveMinimum, selectValidationMaximum, selectValidationMaxLength, selectValidationMinimum, selectValidationMinLength, selectValidationMultipleOf, selectValidationPattern } from "./selectors.js";

export class SchemaExampleGenerator extends SchemaExampleGeneratorBase {
    constructor(
        manager: SchemaManager,
        private readonly indexer: SchemaIndexer,
    ) {
        super(manager);
    }

    public *generateFromNode(
        nodeId: string,
    ): Iterable<[number, unknown]> {
        const nodeItem = this.indexer.getNodeItem(nodeId);

        const nodeRef = selectNodeRef(nodeItem.node);
        if (nodeRef != null) {
            const resolvedNodeId = this.indexer.resolveReferenceNodeId(
                nodeId,
                nodeRef,
            );
            yield* this.generateFromNode(
                resolvedNodeId,
            );
        }

        const nodeDynamicRef = selectNodeDynamicRef(nodeItem.node);
        if (nodeDynamicRef != null) {
            const resolvedNodeId = this.indexer.resolveDynamicReferenceNodeId(
                nodeId,
                nodeDynamicRef,
            );
            yield* this.generateFromNode(
                resolvedNodeId,
            );
        }

        const nodeTypes = selectNodeTypes(nodeItem.node);
        if (nodeTypes != null) {
            yield* this.generateForTypes(
                nodeId,
                nodeTypes,
            );
        }
    }

    protected * generateForArray(
        nodeId: string,
    ): Iterable<[number, unknown]> {
        const nodeItem = this.indexer.getNodeItem(nodeId);

        const itemsEntries = selectNodeItemsEntries(nodeItem.nodePointer, nodeItem.node);

        for (const [subNodePointer, subNode] of itemsEntries) {
            const subNodeUrl = new URL(`#${subNodePointer}`, nodeItem.nodeRootUrl);
            const subNodeId = String(subNodeUrl);

            for (const [errors, example] of this.generateFromNode(
                subNodeId,
            )) {
                yield [errors, [example]];
            }
        }
    }

    protected * generateForObject(
        nodeId: string,
    ): Iterable<[number, unknown]> {
        const nodeItem = this.indexer.getNodeItem(nodeId);

        const propertyNameEntries =
            [...selectNodePropertyNamesEntries(nodeItem.nodePointer, nodeItem.node)];
        const propertyNameMap = Object.fromEntries(propertyNameEntries);
        const propertyEntries =
            [...selectNodePropertyEntries(nodeItem.nodePointer, nodeItem.node)];
        const requiredPropertyNames = new Set(selectNodeRequiredPropertyNames(nodeItem.node));

        {
            /*
            only yield properties that are not required
            */
            const subExamples: Record<string, Array<[number, unknown]>> = {};

            for (const [subNodePointer, subNode] of propertyEntries) {

                const propertyName = propertyNameMap[subNodePointer];
                if (requiredPropertyNames.has(propertyName)) {
                    continue;
                }

                const subNodeUrl = new URL(`#${subNodePointer}`, nodeItem.nodeRootUrl);
                const subNodeId = String(subNodeUrl);

                subExamples[propertyName] = [...this.generateFromNode(
                    subNodeId,
                )];
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

                const propertyName = propertyNameMap[subNodePointer];
                if (!requiredPropertyNames.has(propertyName)) {
                    continue;
                }

                const subNodeUrl = new URL(`#${subNodePointer}`, nodeItem.nodeRootUrl);
                const subNodeId = String(subNodeUrl);

                subExamples[propertyName] = [...this.generateFromNode(
                    subNodeId,
                )];
            }

            /*
            this is quite ineficcient. Would be great if wel van just stream the
            whole thing
            */
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
                const propertyName = propertyNameMap[subNodePointer];
                const subNodeUrl = new URL(`#${subNodePointer}`, nodeItem.nodeRootUrl);
                const subNodeId = String(subNodeUrl);

                subExamples[propertyName] = [...this.generateFromNode(
                    subNodeId,
                )];
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

    protected * generateForString(
        nodeId: string,
    ): Iterable<[number, unknown]> {
        const nodeItem = this.indexer.getNodeItem(nodeId);

        const validationMinLength = selectValidationMinLength(nodeItem.node);
        const validationMaxLength = selectValidationMaxLength(nodeItem.node);
        const validationPattern = selectValidationPattern(nodeItem.node);

        if (validationMinLength != null) {
            yield [1, createString(validationMinLength - 1)];
        }
        if (validationMaxLength != null) {
            yield [1, createString(validationMaxLength + 1)];
        }
        if (validationPattern != null) {
            throw new Error("not implemented");
        }

        let minimumLength = 5;
        if (validationMinLength != null) {
            minimumLength = validationMinLength;
        }

        let maximumLength = 20;
        if (validationMaxLength != null) {
            maximumLength = validationMaxLength;
        }

        yield [
            0,
            createString(
                Math.round(minimumLength + Math.random() * (maximumLength - minimumLength)),
            ),
        ];
    }

    protected * generateForNumber(
        nodeId: string,
    ): Iterable<[number, unknown]> {
        const nodeItem = this.indexer.getNodeItem(nodeId);

        const validationMinimum = selectValidationMinimum(nodeItem.node);
        const validationExclusiveMinimum = selectValidationExclusiveMinimum(nodeItem.node);
        const validationMaximum = selectValidationMaximum(nodeItem.node);
        const validationExclusiveMaximum = selectValidationExclusiveMaximum(nodeItem.node);
        const validationMultipleOf = selectValidationMultipleOf(nodeItem.node);

        if (validationMinimum != null) {
            yield [1, validationMinimum - 1];
        }
        if (validationExclusiveMinimum != null) {
            yield [1, validationExclusiveMinimum];
        }
        if (validationMaximum != null) {
            yield [1, validationMaximum + 1];
        }
        if (validationExclusiveMaximum != null) {
            yield [1, validationExclusiveMaximum];
        }
        if (validationMultipleOf != null) {
            throw new Error("not implemented");
        }

        let minimumValue = Number.MIN_VALUE;
        if (validationMinimum != null) {
            minimumValue = validationMinimum;
        }
        if (validationExclusiveMinimum != null) {
            minimumValue = validationExclusiveMinimum + 1;
        }

        let maximumValue = Number.MAX_VALUE;
        if (validationMaximum != null) {
            maximumValue = validationMaximum;
        }
        if (validationExclusiveMaximum != null) {
            maximumValue = validationExclusiveMaximum - 1;
        }

        yield [
            0,
            minimumValue + Math.random() * (maximumValue - minimumValue),
        ];
    }

    protected * generateForInteger(
        nodeId: string,
    ): Iterable<[number, unknown]> {
        const nodeItem = this.indexer.getNodeItem(nodeId);

        const minimum = selectValidationMinimum(nodeItem.node);
        const exclusiveMinimum = selectValidationExclusiveMinimum(nodeItem.node);
        const maximum = selectValidationMaximum(nodeItem.node);
        const exclusiveMaximum = selectValidationExclusiveMaximum(nodeItem.node);
        const multipleOf = selectValidationMultipleOf(nodeItem.node);

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

        let minimumValue = Number.MIN_SAFE_INTEGER;
        if (minimum != null) {
            minimumValue = minimum;
        }
        if (exclusiveMinimum != null) {
            minimumValue = exclusiveMinimum + 0.5;
        }

        let maximumValue = Number.MAX_SAFE_INTEGER;
        if (maximum != null) {
            maximumValue = maximum;
        }
        if (exclusiveMaximum != null) {
            maximumValue = exclusiveMaximum - 0.5;
        }

        yield [
            0,
            Math.round(minimumValue + Math.random() * (maximumValue - minimumValue)),
        ];
    }

    protected * generateForBoolean(
        nodeId: string,
    ): Iterable<[number, unknown]> {
        yield [0, true];
        yield [0, false];
    }

}
