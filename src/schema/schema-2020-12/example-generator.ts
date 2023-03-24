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

    public generateExamplesFromUrl(
        nodeUrl: URL,
    ): Iterable<unknown> {
        const nodeId = String(nodeUrl);

        const item = this.indexer.getNodeItem(nodeId);
        if (item == null) {
            throw new Error("item not found");
        }

        return this.generateExamplesFromNode(
            item.node,
            nodeUrl,
            "",
        );
    }

    public *generateExamplesFromNode(
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ): Iterable<unknown> {
        const nodeRef = selectNodeRef(node);
        if (nodeRef != null) {
            const nodeRefUrl = new URL(nodeRef, nodeUrl);
            return this.generateExamplesFromUrl(nodeRefUrl);
        }

        const nodeTypes = selectNodeTypes(node);
        if (nodeTypes != null) {
            for (const type of nodeTypes) {
                yield* this.generateExamplesForType(type, node, nodeUrl, nodePointer);
            }
        }
    }

    private generateExamplesForType(
        type: string,
        node: SchemaNode,
        nodeUrl: URL,
        nodePointer: string,
    ) {
        switch (type) {
            case "null":
                return this.generateExamplesForNull(node, nodeUrl, nodePointer);

            case "array":
                return this.generateExamplesForArray(node, nodeUrl, nodePointer);

            case "object":
                return this.generateExamplesForObject(node, nodeUrl, nodePointer);

            case "string":
                return this.generateExamplesForString(node, nodeUrl, nodePointer);

            case "number":
                return this.generateExamplesForNumber(node, nodeUrl, nodePointer);

            case "integer":
                return this.generateExamplesForInteger(node, nodeUrl, nodePointer);

            case "boolean":
                return this.generateExamplesForBoolean(node, nodeUrl, nodePointer);

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
        const requiredPropertyNames = new Set(selectNodeRequiredPropertyNames(node));
        const propertyNameEntries = [...selectNodePropertyNamesEntries(nodePointer, node)];
        const propertyNameMap = Object.fromEntries(propertyNameEntries);
        const propertyEntries = [...selectNodePropertyEntries(nodePointer, node)];
        const propertyNames = new Set(propertyNameEntries.map(([, name]) => name));

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
                )];
            }

            yield* flattenObject(subExamples);
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

