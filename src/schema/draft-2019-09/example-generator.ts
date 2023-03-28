import { createString, flattenObject } from "../../utils/index.js";
import { SchemaExampleGeneratorBase } from "../example-generator.js";
import { SchemaManager } from "../manager.js";
import { SchemaIndexer } from "./indexer.js";
import { selectNodeItemsOneEntries, selectNodePropertyEntries, selectNodePropertyNamesEntries, selectNodeRecursiveRef, selectNodeRef, selectNodeRequiredPropertyNames, selectNodeTypes, selectValidationExclusiveMaximum, selectValidationExclusiveMinimum, selectValidationMaximum, selectValidationMaxLength, selectValidationMinimum, selectValidationMinLength, selectValidationMultipleOf, selectValidationPattern } from "./selectors.js";

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

        const nodeRecursiveRef = selectNodeRecursiveRef(nodeItem.node);
        if (nodeRecursiveRef != null) {
            const resolvedNodeId = this.indexer.resolveRecursiveReferenceNodeId(
                nodeId,
                nodeRecursiveRef,
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

        const itemsEntries = selectNodeItemsOneEntries(nodeItem.nodePointer, nodeItem.node);

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

        const minLength = selectValidationMinLength(nodeItem.node);
        const maxLength = selectValidationMaxLength(nodeItem.node);
        const pattern = selectValidationPattern(nodeItem.node);

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

    protected * generateForNumber(
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

        // TODO robust implementation
        const minValueOrDefault = minimum ?? exclusiveMinimum ?? -1000;
        const maxValueOrDefault = maximum ?? exclusiveMaximum ?? +1000;

        yield [
            0,
            minValueOrDefault + (maxValueOrDefault - minValueOrDefault),
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

        // TODO robust implementation
        const minValueOrDefault = minimum ?? exclusiveMinimum ?? -1000;
        const maxValueOrDefault = maximum ?? exclusiveMaximum ?? +1000;

        yield [
            0,
            Math.round(minValueOrDefault + (maxValueOrDefault - minValueOrDefault)),
        ];
    }

    protected * generateForBoolean(
        nodeId: string,
    ): Iterable<[number, unknown]> {
        yield [0, true];
        yield [0, false];
    }

}
