import { flattenObject, pointerToHash, simpleTypes } from "../../utils/index.js";
import { SchemaExampleGeneratorBase } from "../example-generator.js";
import { SchemaManager } from "../manager.js";
import { SchemaIndexer } from "./indexer.js";
import { SchemaLoader } from "./loader.js";
import { SchemaNode } from "./node.js";
import { selectNodeItemsEntries, selectNodePropertyEntries, selectNodePropertyNamesEntries, selectNodeRef, selectNodeRequiredPropertyNames, selectNodeTypes } from "./selectors.js";

export class SchemaInvalidExampleGenerator extends SchemaExampleGeneratorBase {
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
        for (const [errors, example] of this.generateFromUrl(
            nodeUrl,
        )) {
            if (errors !== 1) {
                continue;
            }
            yield example;
        }
    }

    public *generateFromUrl(
        nodeUrl: URL,
    ): Iterable<[number, unknown]> {
        const nodeId = String(nodeUrl);

        const item = this.indexer.getNodeItem(nodeId);
        if (item == null) {
            throw new Error("item not found");
        }

        yield* this.generateFromNode(
            item.node,
            nodeUrl,
            "",
        );
    }

    private *generateFromNode(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ): Iterable<[number, unknown]> {
        const nodeRef = selectNodeRef(node);
        if (nodeRef != null) {
            const nodeRefUrl = new URL(nodeRef, nodeUrl);
            yield* this.generateFromUrl(nodeRefUrl);
        }

        const nodeTypes = selectNodeTypes(node);
        if (nodeTypes != null) {
            yield* this.generateForTypes(
                nodeTypes,
                node,
                nodeUrl,
                nodePointer,
            );
        }
    }

    private *generateForTypes(
        types: string[],
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ): Iterable<[number, unknown]> {
        const typeSet = new Set(types);

        for (const type of simpleTypes) {
            if (typeSet.has(type)) {
                yield* this.generateForType(
                    type,
                    node,
                    nodeUrl,
                    nodePointer,
                );
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
    ): Iterable<[number, unknown]> {
        switch (type) {
            case "null":
                yield* this.generateForNull(
                    node,
                    nodeUrl,
                    nodePointer,
                );
                break;

            case "array":
                yield* this.generateForArray(
                    node,
                    nodeUrl,
                    nodePointer,
                );
                break;

            case "object":
                yield* this.generateForObject(
                    node,
                    nodeUrl,
                    nodePointer,
                );
                break;

            case "string":
                yield* this.generateForString(
                    node,
                    nodeUrl,
                    nodePointer,
                );
                break;

            case "number":
                yield* this.generateForNumber(
                    node,
                    nodeUrl,
                    nodePointer,
                );
                break;

            case "integer":
                yield* this.generateForInteger(
                    node,
                    nodeUrl,
                    nodePointer,
                );
                break;

            case "boolean":
                yield* this.generateForBoolean(
                    node,
                    nodeUrl,
                    nodePointer,
                );
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
    ): Iterable<[number, unknown]> {
        const itemsEntries = selectNodeItemsEntries(nodePointer, node);

        for (const [subNodePointer, subNode] of itemsEntries) {
            const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeUrl);

            for (const [errors, example] of this.generateFromNode(
                subNode,
                subNodeUrl,
                subNodePointer,
            )) {
                yield [errors, example];
            }
        }
    }

    private * generateForObject(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
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
                subExamples[propertyName] = [...this.generateFromNode(
                    subNode,
                    subNodeUrl,
                    subNodePointer,
                )];
            }

            for (const flattened of flattenObject(subExamples)) {
                const errors = Object.values(flattened).
                    reduce((sum, [errors]) => sum + errors, 0);
                const example = Object.fromEntries(
                    Object.entries(flattened).map(([key, [, value]]) => [key, value]),
                );
                yield [errors + 1, example];
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
                subExamples[propertyName] = [...this.generateFromNode(
                    subNode,
                    subNodeUrl,
                    subNodePointer,
                )];
            }

            for (const flattened of flattenObject(subExamples)) {
                const errors = Object.values(flattened).
                    reduce((sum, [errors]) => sum + errors, 0);
                const example = Object.fromEntries(
                    Object.entries(flattened).
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
        yield [0, "a string!"];
    }

    private * generateForNumber(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ): Iterable<[number, unknown]> {
        yield [0, 1.5];
    }

    private * generateForInteger(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ): Iterable<[number, unknown]> {
        yield [0, 1];
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

