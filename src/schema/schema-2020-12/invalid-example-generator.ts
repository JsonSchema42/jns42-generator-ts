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
        const nodeId = String(nodeUrl);

        const item = this.indexer.getNodeItem(nodeId);
        if (item == null) {
            throw new Error("item not found");
        }

        const nodeIds = [...this.indexer.getAllNodeIds()];
        for (const nodeId of nodeIds) {
            for (const [fails, example] of this.generateFromNode(
                item.node,
                nodeUrl,
                "",
                nodeId,
            )) {
                if (!fails) {
                    continue;
                }
                yield example;
            }
        }
    }

    public *generateFromUrl(
        nodeUrl: URL,
    ): Iterable<[boolean, unknown]> {
        const nodeId = String(nodeUrl);

        const item = this.indexer.getNodeItem(nodeId);
        if (item == null) {
            throw new Error("item not found");
        }

        const nodeIds = [...this.indexer.getAllNodeIds()];
        for (const nodeId of nodeIds) {
            yield* this.generateFromNode(
                item.node,
                nodeUrl,
                "",
                nodeId,
            );
        }
    }

    private *generateFromNode(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ): Iterable<[boolean, unknown]> {
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
                failNodeId,
            );
        }
    }

    private *generateForTypes(
        types: string[],
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ): Iterable<[boolean, unknown]> {
        const typeSet = new Set(types);

        const nodeId = String(nodeUrl);

        if (nodeId === failNodeId) {
            for (const type of simpleTypes) {
                if (typeSet.has(type)) {
                    continue;
                }

                switch (type) {
                    case "null":
                        yield [true, null];
                        break;

                    case "array":
                        yield [true, []];
                        break;

                    case "object":
                        yield [true, {}];
                        break;

                    case "string":
                        yield [true, "fail!!"];
                        break;

                    case "number":
                        yield [true, 10.1];
                        break;

                    case "integer":
                        yield [true, 10];
                        break;

                    case "boolean":
                        yield [true, true];
                        yield [true, false];
                        break;
                }

            }
        }

        for (const type of types) {
            yield* this.generateForType(
                type,
                node,
                nodeUrl,
                nodePointer,
                failNodeId,
            );
        }
    }

    private * generateForType(
        type: string,
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ): Iterable<[boolean, unknown]> {
        switch (type) {
            case "null":
                yield* this.generateForNull(
                    node,
                    nodeUrl,
                    nodePointer,
                    failNodeId,
                );
                break;

            case "array":
                yield* this.generateForArray(
                    node,
                    nodeUrl,
                    nodePointer,
                    failNodeId,
                );
                break;

            case "object":
                yield* this.generateForObject(
                    node,
                    nodeUrl,
                    nodePointer,
                    failNodeId,
                );
                break;

            case "string":
                yield* this.generateForString(
                    node,
                    nodeUrl,
                    nodePointer,
                    failNodeId,
                );
                break;

            case "number":
                yield* this.generateForNumber(
                    node,
                    nodeUrl,
                    nodePointer,
                    failNodeId,
                );
                break;

            case "integer":
                yield* this.generateForInteger(
                    node,
                    nodeUrl,
                    nodePointer,
                    failNodeId,
                );
                break;

            case "boolean":
                yield* this.generateForBoolean(
                    node,
                    nodeUrl,
                    nodePointer,
                    failNodeId,
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
        failNodeId: string,
    ): Iterable<[boolean, unknown]> {
        if (this.indexer.isNodeAncestor(failNodeId, nodeUrl)) {
            return;
        }

        const nodeId = String(nodeUrl);

        if (nodeId === failNodeId) {
            //
        }
        else {
            yield [false, null];
        }
    }

    private * generateForArray(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ): Iterable<[boolean, unknown]> {
        const itemsEntries = selectNodeItemsEntries(nodePointer, node);

        for (const [subNodePointer, subNode] of itemsEntries) {
            const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeUrl);

            for (const [fails, example] of this.generateFromNode(
                subNode,
                subNodeUrl,
                subNodePointer,
                failNodeId,
            )) {
                yield [fails, example];
            }
        }
    }

    private * generateForObject(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ): Iterable<[boolean, unknown]> {
        const nodeId = String(nodeUrl);

        const propertyNameEntries = [...selectNodePropertyNamesEntries(nodePointer, node)];
        const propertyNameMap = Object.fromEntries(propertyNameEntries);
        const propertyEntries = [...selectNodePropertyEntries(nodePointer, node)];
        const requiredPropertyNames = new Set(selectNodeRequiredPropertyNames(node));

        if (nodeId === failNodeId) {
            /*
            only yield properties that are not required
            */
            const subExamples: Record<string, Array<[boolean, unknown]>> = {};

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
                    failNodeId,
                )];
            }

            for (const flattened of flattenObject(subExamples)) {
                const example = Object.fromEntries(
                    Object.entries(flattened).map(([key, [, value]]) => [key, value]),
                );
                yield [true, example];
            }
        }

        /*
        yield all properties
        */
        {
            const subExamples: Record<string, Array<[boolean, unknown]>> = {};

            for (const [subNodePointer, subNode] of propertyEntries) {
                // eslint-disable-next-line security/detect-object-injection
                const propertyName = propertyNameMap[subNodePointer];
                const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeUrl);

                // eslint-disable-next-line security/detect-object-injection
                subExamples[propertyName] = [...this.generateFromNode(
                    subNode,
                    subNodeUrl,
                    subNodePointer,
                    failNodeId,
                )];
            }

            for (const flattened of flattenObject(subExamples)) {
                const fails = Object.values(flattened).some(([fails]) => fails);
                const example = Object.fromEntries(
                    Object.entries(flattened).map(([key, [, value]]) => [key, value]),
                );
                yield [fails, example];
            }
        }

    }

    private * generateForString(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ): Iterable<[boolean, unknown]> {
        if (this.indexer.isNodeAncestor(failNodeId, nodeUrl)) {
            return;
        }
        const nodeId = String(nodeUrl);

        if (nodeId === failNodeId) {
            //
        }
        else {
            yield [false, "a string!"];
        }
    }

    private * generateForNumber(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ): Iterable<[boolean, unknown]> {
        if (this.indexer.isNodeAncestor(failNodeId, nodeUrl)) {
            return;
        }
        const nodeId = String(nodeUrl);

        if (nodeId === failNodeId) {
            //
        }
        else {
            yield [false, 1.5];
        }
    }

    private * generateForInteger(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ): Iterable<[boolean, unknown]> {
        if (this.indexer.isNodeAncestor(failNodeId, nodeUrl)) {
            return;
        }

        const nodeId = String(nodeUrl);

        if (nodeId === failNodeId) {
            //
        }
        else {
            yield [false, 1];
        }
    }

    private * generateForBoolean(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ): Iterable<[boolean, unknown]> {
        if (this.indexer.isNodeAncestor(failNodeId, nodeUrl)) {
            return;
        }

        const nodeId = String(nodeUrl);

        if (nodeId === failNodeId) {
            //
        }
        else {
            yield [false, true];
            yield [false, false];
        }
    }

}

