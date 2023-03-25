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
            yield* this.generateExamplesFromNode(
                item.node,
                nodeUrl,
                "",
                nodeId,
            );
        }
    }

    private *generateExamplesFromNode(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
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
                failNodeId,
            );
        }
    }

    private *generateExamplesForTypes(
        types: string[],
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ) {
        const typeSet = new Set(types);

        const nodeId = String(nodeUrl);

        if (nodeId === failNodeId) {
            for (const type of simpleTypes) {
                if (typeSet.has(type)) {
                    continue;
                }

                switch (type) {
                    case "null":
                        yield null;
                        break;

                    case "array":
                        yield [];
                        break;

                    case "object":
                        yield {};
                        break;

                    case "string":
                        yield "fail!!";
                        break;

                    case "number":
                        yield 10.1;
                        break;

                    case "integer":
                        yield 10;
                        break;

                    case "boolean":
                        yield true;
                        yield false;
                        break;
                }

            }
        }

        if (!this.indexer.isNodeAncestor(failNodeId, nodeUrl)) {
            for (const type of types) {
                yield* this.generateExamplesForType(
                    type,
                    node,
                    nodeUrl,
                    nodePointer,
                    failNodeId,
                );
            }
        }
    }

    private * generateExamplesForType(
        type: string,
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ) {
        switch (type) {
            case "null":
                yield* this.generateExamplesForNull(
                    node,
                    nodeUrl,
                    nodePointer,
                    failNodeId,
                );
                break;

            case "array":
                yield* this.generateExamplesForArray(
                    node,
                    nodeUrl,
                    nodePointer,
                    failNodeId,
                );
                break;

            case "object":
                yield* this.generateExamplesForObject(
                    node,
                    nodeUrl,
                    nodePointer,
                    failNodeId,
                );
                break;

            case "string":
                yield* this.generateExamplesForString(
                    node,
                    nodeUrl,
                    nodePointer,
                    failNodeId,
                );
                break;

            case "number":
                yield* this.generateExamplesForNumber(
                    node,
                    nodeUrl,
                    nodePointer,
                    failNodeId,
                );
                break;

            case "integer":
                yield* this.generateExamplesForInteger(
                    node,
                    nodeUrl,
                    nodePointer,
                    failNodeId,
                );
                break;

            case "boolean":
                yield* this.generateExamplesForBoolean(
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

    private * generateExamplesForNull(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ) {
        const nodeId = String(nodeUrl);

        if (nodeId === failNodeId) {
            //
        }
        else {
            yield null;
        }
    }

    private * generateExamplesForArray(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ) {
        const itemsEntries = selectNodeItemsEntries(nodePointer, node);

        for (const [subNodePointer, subNode] of itemsEntries) {
            const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeUrl);

            for (const example of this.generateExamplesFromNode(
                subNode,
                subNodeUrl,
                subNodePointer,
                failNodeId,
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
        failNodeId: string,
    ) {
        const nodeId = String(nodeUrl);

        const propertyNameEntries = [...selectNodePropertyNamesEntries(nodePointer, node)];
        const propertyNameMap = Object.fromEntries(propertyNameEntries);
        const propertyEntries = [...selectNodePropertyEntries(nodePointer, node)];
        const propertyNames = new Set(propertyNameEntries.map(([, name]) => name));
        const requiredPropertyNames = new Set(selectNodeRequiredPropertyNames(node));

        /*
        only yield properties that are not required
        */
        if (nodeId === failNodeId) {
            const subExamples: Record<string, unknown[]> = {};

            for (const [subNodePointer, subNode] of propertyEntries) {
                // eslint-disable-next-line security/detect-object-injection
                const propertyName = propertyNameMap[subNodePointer];
                if (requiredPropertyNames.has(propertyName)) {
                    continue;
                }

                const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeUrl);

                // eslint-disable-next-line security/detect-object-injection
                subExamples[propertyName] = [...this.generateExamplesFromNode(
                    subNode,
                    subNodeUrl,
                    subNodePointer,
                    failNodeId,
                )];
            }

            yield* flattenObject(subExamples);
        }

        /*
        yield all properties
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
                const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeUrl);

                // eslint-disable-next-line security/detect-object-injection
                subExamples[propertyName] = [...this.generateExamplesFromNode(
                    subNode,
                    subNodeUrl,
                    subNodePointer,
                    failNodeId,
                )];
            }

            yield* flattenObject(subExamples);
        }

    }

    private * generateExamplesForString(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ) {
        const nodeId = String(nodeUrl);

        if (nodeId === failNodeId) {
            //
        }
        else {
            yield "a string!";
        }
    }

    private * generateExamplesForNumber(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ) {
        const nodeId = String(nodeUrl);

        if (nodeId === failNodeId) {
            //
        }
        else {
            yield 1.5;
        }
    }

    private * generateExamplesForInteger(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ) {
        const nodeId = String(nodeUrl);

        if (nodeId === failNodeId) {
            //
        }
        else {
            yield 1;
        }
    }

    private * generateExamplesForBoolean(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
        failNodeId: string,
    ) {
        const nodeId = String(nodeUrl);

        if (nodeId === failNodeId) {
            //
        }
        else {
            yield true;
            yield false;
        }
    }

}

