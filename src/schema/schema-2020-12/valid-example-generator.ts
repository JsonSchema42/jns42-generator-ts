import deepEqual from "fast-deep-equal";
import { flattenObject, pointerToHash } from "../../utils/index.js";
import { SchemaExampleGeneratorBase } from "../example-generator.js";
import { SchemaManager } from "../manager.js";
import { SchemaIndexer } from "./indexer.js";
import { SchemaLoader } from "./loader.js";
import { SchemaNode } from "./node.js";
import { selectNodeItemsEntries, selectNodePropertyEntries, selectNodePropertyNamesEntries, selectNodeRef, selectNodeRequiredPropertyNames, selectNodeTypes } from "./selectors.js";

export class SchemaExampleGenerator extends SchemaExampleGeneratorBase {
    constructor(
        manager: SchemaManager,
        private readonly loader: SchemaLoader,
        private readonly indexer: SchemaIndexer,
    ) {
        super(manager);
    }

    public *generateExamplesFromUrl(
        nodeUrl: URL,
    ): Iterable<unknown> {
        const nodeId = String(nodeUrl);

        const item = this.indexer.getNodeItem(nodeId);
        if (item == null) {
            throw new Error("item not found");
        }

        yield* this.generateExamplesFromNode(
            item.node,
            nodeUrl,
            "",
        );
    }

    private *generateExamplesFromNode(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ): Iterable<unknown> {
        const nodeRef = selectNodeRef(node);
        if (nodeRef != null) {
            const nodeRefUrl = new URL(nodeRef, nodeUrl);
            yield* this.generateExamplesFromUrl(nodeRefUrl);
        }

        const nodeTypes = selectNodeTypes(node);
        if (nodeTypes != null) {
            yield* this.generateExamplesForTypes(
                nodeTypes,
                node,
                nodeUrl,
                nodePointer,
            );
        }
    }

    private *generateExamplesForTypes(
        types: string[],
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ) {
        for (const type of types) {
            yield* this.generateExamplesForType(
                type,
                node,
                nodeUrl,
                nodePointer,
            );
        }
    }

    private * generateExamplesForType(
        type: string,
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ) {
        switch (type) {
            case "null":
                yield* this.generateExamplesForNull(node, nodeUrl, nodePointer);
                break;

            case "array":
                yield* this.generateExamplesForArray(node, nodeUrl, nodePointer);
                break;

            case "object":
                yield* this.generateExamplesForObject(node, nodeUrl, nodePointer);
                break;

            case "string":
                yield* this.generateExamplesForString(node, nodeUrl, nodePointer);
                break;

            case "number":
                yield* this.generateExamplesForNumber(node, nodeUrl, nodePointer);
                break;

            case "integer":
                yield* this.generateExamplesForInteger(node, nodeUrl, nodePointer);
                break;

            case "boolean":
                yield* this.generateExamplesForBoolean(node, nodeUrl, nodePointer);
                break;

            default:
                throw new Error("type not supported");

        }
    }

    private * generateExamplesForNull(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ) {
        yield null;
    }

    private * generateExamplesForArray(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ) {
        const itemsEntries = selectNodeItemsEntries(nodePointer, node);

        for (const [subNodePointer, subNode] of itemsEntries) {
            const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeUrl);

            for (const example of this.generateExamplesFromNode(
                subNode,
                subNodeUrl,
                subNodePointer,
            )) {
                yield [
                    example,
                    example,
                    example,
                ];
            }
        }
    }

    private * generateExamplesForObject(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ) {
        const propertyNameEntries = [...selectNodePropertyNamesEntries(nodePointer, node)];
        const propertyNameMap = Object.fromEntries(propertyNameEntries);
        const propertyEntries = [...selectNodePropertyEntries(nodePointer, node)];
        const propertyNames = new Set(propertyNameEntries.map(([, name]) => name));
        const requiredPropertyNames = new Set(selectNodeRequiredPropertyNames(node));

        /*
        yield properties that are required
        */
        {
            const subExamples: Record<string, unknown[]> = {};

            /*
            properties without a schema
            */
            for (const propertyName of requiredPropertyNames) {
                if (propertyNames.has(propertyName)) {
                    continue;
                }
                // eslint-disable-next-line security/detect-object-injection
                subExamples[propertyName] = ["Could be anything"];
            }

            for (const [subNodePointer, subNode] of propertyEntries) {
                // eslint-disable-next-line security/detect-object-injection
                const propertyName = propertyNameMap[subNodePointer];
                if (!requiredPropertyNames.has(propertyName)) {
                    continue;
                }

                const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeUrl);

                // eslint-disable-next-line security/detect-object-injection
                subExamples[propertyName] = [...this.generateExamplesFromNode(
                    subNode,
                    subNodeUrl,
                    subNodePointer,
                )];
            }

            yield* flattenObject(subExamples);

            /*
            yield all properties, but only if they are different from the required properties
            */
            if (deepEqual([...requiredPropertyNames], [...propertyNames])) {
                const subExamples: Record<string, unknown[]> = {};

                /*
                properties without a schema
                */
                for (const propertyName of requiredPropertyNames) {
                    if (propertyNames.has(propertyName)) {
                        continue;
                    }
                    // eslint-disable-next-line security/detect-object-injection
                    subExamples[propertyName] = ["Could be anything"];
                }

                for (const [subNodePointer, subNode] of propertyEntries) {
                    // eslint-disable-next-line security/detect-object-injection
                    const propertyName = propertyNameMap[subNodePointer];
                    const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeUrl);

                    // eslint-disable-next-line security/detect-object-injection
                    subExamples[propertyName] = [...this.generateExamplesFromNode(
                        subNode,
                        subNodeUrl,
                        subNodePointer,
                    )];
                }

                yield* flattenObject(subExamples);
            }
        }

    }

    private * generateExamplesForString(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ) {
        yield "a string!";
    }

    private * generateExamplesForNumber(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ) {
        yield 1;
        yield 0.5;
    }

    private * generateExamplesForInteger(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ) {
        yield 1;
    }

    private * generateExamplesForBoolean(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ) {
        yield true;
        yield false;
    }

}

