import { CompoundDescriptorUnion, NodeDescriptor, TypeDescriptorUnion } from "../descriptors.js";
import { SchemaStrategyBase } from "../strategy.js";
import { metaSchemaId } from "./meta.js";
import { selectAllSubNodes, selectAllSubNodesAndSelf, selectNodeDescription, selectNodeEnum, selectNodeId, selectNodePropertyNamesEntries, selectNodeRef, selectNodeSchema, selectNodeTypes, selectSubNodeAdditionalItemsEntries, selectSubNodeAdditionalPropertiesEntries, selectSubNodeAllOfEntries, selectSubNodeAnyOfEntries, selectSubNodeItemsManyEntries, selectSubNodeItemsOneEntries, selectSubNodeOneOfEntries, selectSubNodes, selectValidationMaximumExclusive, selectValidationMaximumInclusive, selectValidationMaximumItems, selectValidationMaximumLength, selectValidationMaximumProperties, selectValidationMinimumExclusive, selectValidationMinimumInclusive, selectValidationMinimumItems, selectValidationMinimumLength, selectValidationMinimumProperties, selectValidationMultipleOf, selectValidationRequired, selectValidationUniqueItems, selectValidationValuePattern } from "./selectors.js";
import { Schema } from "./types.js";
import { isSchema } from "./validators.js";

export class SchemaStrategy extends SchemaStrategyBase<Schema> {

    //#region super implementation

    protected readonly metaSchemaId = metaSchemaId;

    public isSchemaRootNode(node: unknown): node is Schema {
        const schemaId = selectNodeSchema(node as any);
        if (schemaId == null) {
            return false;
        }
        return schemaId === this.metaSchemaId;
    }
    public isSchema(node: unknown): node is Schema {
        return isSchema(node);
    }

    public *selectAllReferencedNodeUrls(
        rootNode: Schema,
        rootNodeUrl: URL,
        retrievalUrl: URL,
    ): Iterable<readonly [URL, URL]> {
        for (const [pointer, node] of selectAllSubNodesAndSelf("", rootNode)) {
            const nodeRef = selectNodeRef(node);
            if (nodeRef == null) {
                continue;
            }

            const refNodeUrl = new URL(nodeRef, rootNodeUrl);
            const refRetrievalUrl = new URL(nodeRef, retrievalUrl);
            refRetrievalUrl.hash = "";

            yield [refNodeUrl, refRetrievalUrl] as const;

        }
    }

    public selectNodeUrl(node: Schema) {
        const nodeId = selectNodeId(node);
        if (nodeId != null) {
            const nodeUrl = new URL(nodeId);
            return nodeUrl;
        }
    }

    protected makeNodeUrl(
        node: Schema,
        nodeRootUrl: URL,
        nodePointer: string,
    ): URL {
        let nodeUrl = this.selectNodeUrl(node);
        if (nodeUrl != null) {
            return nodeUrl;
        }

        nodeUrl = new URL(`#${nodePointer}`, nodeRootUrl);
        return nodeUrl;
    }

    public selectSubNodeEntries(
        nodePointer: string,
        node: Schema,
    ): Iterable<readonly [string, Schema]> {
        return selectSubNodes(nodePointer, node);
    }

    public selectAllSubNodeEntries(
        nodePointer: string,
        node: Schema,
    ): Iterable<readonly [string, Schema]> {
        return selectAllSubNodes(nodePointer, node);
    }

    public selectAllSubNodeEntriesAndSelf(
        nodePointer: string,
        node: Schema,
    ): Iterable<readonly [string, Schema]> {
        return selectAllSubNodesAndSelf(nodePointer, node);
    }

    protected async loadFromNode(
        node: Schema,
        nodeUrl: URL,
        retrievalUrl: URL,
    ) {
        const nodeRef = selectNodeRef(node);

        if (nodeRef != null) {
            const nodeRefUrl = new URL(nodeRef, nodeUrl);
            const retrievalRefUrl = new URL(nodeRef, retrievalUrl);
            retrievalRefUrl.hash = "";
            await this.context.loadFromUrl(
                nodeRefUrl,
                retrievalRefUrl,
                nodeUrl,
                this.metaSchemaId,
            );
        }

    }

    //#endregion

    //#region strategy implementation

    public * selectNodeDescriptors(
    ): Iterable<NodeDescriptor> {
        for (const [nodeId, { node }] of this.getNodeItemEntries()) {
            const description = selectNodeDescription(node) ?? "";
            const deprecated = false;
            const examples = new Array<unknown>();

            let superNodeId: string | undefined;

            const nodeRef = selectNodeRef(node);

            if (nodeRef != null) {
                const resolvedNodeId = this.resolveReferenceNodeId(
                    nodeId,
                    nodeRef,
                );

                superNodeId = resolvedNodeId;
            }

            yield {
                nodeId,
                superNodeId,
                deprecated,
                description,
                examples,
            };
        }
    }

    public *selectNodeTypeDescriptors(
        nodeId: string,
    ): Iterable<TypeDescriptorUnion> {
        const nodeItem = this.getNodeItem(nodeId);

        if (nodeItem.node === true) {
            yield {
                type: "any",
            };
        }

        if (nodeItem.node === false) {
            yield {
                type: "never",
            };
        }

        const types = selectNodeTypes(nodeItem.node);
        if (types != null) {
            for (const type of types) {
                switch (type) {
                    case "null":
                        yield* this.makeNodeTypeDescriptorFromNull();
                        break;

                    case "boolean":
                        yield* this.makeNodeTypeDescriptorFromBoolean(
                            nodeItem.node,
                        );
                        break;

                    case "integer":
                        yield* this.makeNodeTypeDescriptorFromNumber(
                            nodeItem.node,
                            "integer",
                        );
                        break;

                    case "number":
                        yield* this.makeNodeTypeDescriptorFromNumber(
                            nodeItem.node,
                            "float",
                        );
                        break;

                    case "string":
                        yield* this.makeNodeTypeDescriptorFromString(
                            nodeItem.node,
                        );
                        break;

                    case "array":
                        yield* this.makeNodeTypeDescriptorFromArray(
                            nodeItem.node,
                            nodeItem.nodeRootUrl,
                            nodeItem.nodePointer,
                        );
                        break;

                    case "object":
                        yield* this.makeNodeTypeDescriptorFromObject(
                            nodeItem.node,
                            nodeItem.nodeRootUrl,
                            nodeItem.nodePointer,
                        );
                        break;

                }
            }
        }
    }

    public *selectNodeCompoundDescriptors(
        nodeId: string,
    ): Iterable<CompoundDescriptorUnion> {
        const nodeItem = this.getNodeItem(nodeId);

        yield* this.makeNodeCompoundDescriptorFromAllOf(
            nodeItem.node,
            nodeItem.nodeRootUrl,
            nodeItem.nodePointer,
        );
        yield* this.makeNodeCompoundDescriptorFromAnyOf(
            nodeItem.node,
            nodeItem.nodeRootUrl,
            nodeItem.nodePointer,
        );
        yield* this.makeNodeCompoundDescriptorFromOneOf(
            nodeItem.node,
            nodeItem.nodeRootUrl,
            nodeItem.nodePointer,
        );

    }

    private * makeNodeTypeDescriptorFromNull(): Iterable<TypeDescriptorUnion> {
        yield {
            type: "null",
        };
    }

    private * makeNodeTypeDescriptorFromBoolean(
        node: Schema,
    ): Iterable<TypeDescriptorUnion> {
        const enumValues = selectNodeEnum(node) as unknown[];

        let options: Array<boolean> | undefined;

        if (enumValues != null) {
            options = [...enumValues] as boolean[];
        }

        yield {
            type: "boolean",
            options,
        };
    }

    private * makeNodeTypeDescriptorFromNumber(
        node: Schema,
        numberType: "integer" | "float",
    ): Iterable<TypeDescriptorUnion> {
        const enumValues = selectNodeEnum(node) as unknown[];

        let options: Array<number> | undefined;

        if (enumValues != null) {
            options = [...enumValues] as number[];
        }

        const minimumInclusive = selectValidationMinimumInclusive(node);
        const minimumExclusive = selectValidationMinimumExclusive(node);
        const maximumInclusive = selectValidationMaximumInclusive(node);
        const maximumExclusive = selectValidationMaximumExclusive(node);
        const multipleOf = selectValidationMultipleOf(node);

        yield {
            type: "number",
            numberType,
            options,
            minimumInclusive,
            minimumExclusive,
            maximumInclusive,
            maximumExclusive,
            multipleOf,
        };
    }

    private * makeNodeTypeDescriptorFromString(
        node: Schema,
    ): Iterable<TypeDescriptorUnion> {
        const enumValues = selectNodeEnum(node) as unknown[];

        let options: Array<string> | undefined;

        if (enumValues != null) {
            options = [...enumValues] as string[];
        }

        const minimumLength = selectValidationMinimumLength(node);
        const maximumLength = selectValidationMaximumLength(node);
        const valuePattern = selectValidationValuePattern(node);

        yield {
            type: "string",
            options,
            minimumLength,
            maximumLength,
            valuePattern,
        };
    }

    private * makeNodeTypeDescriptorFromArray(
        node: Schema,
        nodeRootUrl: URL,
        nodePointer: string,
    ): Iterable<TypeDescriptorUnion> {
        const itemsOne = [...selectSubNodeItemsOneEntries(nodePointer, node)];
        const itemsMany = [...selectSubNodeItemsManyEntries(nodePointer, node)];
        const additionalItems = [...selectSubNodeAdditionalItemsEntries(nodePointer, node)];
        const minimumItems = selectValidationMinimumItems(node);
        const maximumItems = selectValidationMaximumItems(node);
        const uniqueItems = selectValidationUniqueItems(node) ?? false;

        if (itemsMany.length > 0) {
            const itemTypeNodeIds = itemsMany.map(([itemNodePointer]) => {
                const itemNodeUrl = new URL(
                    `#${itemNodePointer}`,
                    nodeRootUrl,
                );
                const itemNodeId = String(itemNodeUrl);
                return itemNodeId;
            });

            yield {
                type: "tuple",
                itemTypeNodeIds: itemTypeNodeIds,
            };
        }

        else if (itemsOne.length > 0) {
            const itemTypeNodeIds = itemsOne.map(([itemNodePointer]) => {
                const itemNodeUrl = new URL(
                    `#${itemNodePointer}`,
                    nodeRootUrl,
                );
                const itemNodeId = String(itemNodeUrl);
                return itemNodeId;
            });

            for (const itemTypeNodeId of itemTypeNodeIds) {
                yield {
                    type: "array",
                    minimumItems,
                    maximumItems,
                    uniqueItems,
                    itemTypeNodeId,
                };
            }
        }

        else if (additionalItems.length > 0) {
            const itemTypeNodeIds = additionalItems.map(([itemNodePointer]) => {
                const itemNodeUrl = new URL(
                    `#${itemNodePointer}`,
                    nodeRootUrl,
                );
                const itemNodeId = String(itemNodeUrl);
                return itemNodeId;
            });

            for (const itemTypeNodeId of itemTypeNodeIds) {
                yield {
                    type: "array",
                    minimumItems,
                    maximumItems,
                    uniqueItems,
                    itemTypeNodeId,
                };
            }
        }
    }

    private * makeNodeTypeDescriptorFromObject(
        node: Schema,
        nodeRootUrl: URL,
        nodePointer: string,
    ): Iterable<TypeDescriptorUnion> {
        const propertyNames = [...selectNodePropertyNamesEntries(nodePointer, node)];
        const additionalProperties =
            [...selectSubNodeAdditionalPropertiesEntries(nodePointer, node)];
        const minimumProperties = selectValidationMinimumProperties(node);
        const maximumProperties = selectValidationMaximumProperties(node);

        const requiredProperties = selectValidationRequired(node) ?? [];

        if (propertyNames.length > 0) {
            const propertyTypeNodeIds = Object.fromEntries(
                propertyNames.map(([propertyNodePointer, propertyName]) => {
                    const propertyNodeUrl = new URL(
                        `#${propertyNodePointer}`,
                        nodeRootUrl,
                    );
                    const propertyNodeId = String(propertyNodeUrl);
                    return [propertyName, propertyNodeId];
                }),
            );

            yield {
                type: "interface",
                requiredProperties,
                propertyTypeNodeIds,
            };
        }

        else if (additionalProperties.length > 0) {
            const propertyTypeNodeIds = additionalProperties.map(([propertyNodePointer]) => {
                const propertyNodeUrl = new URL(
                    `#${propertyNodePointer}`,
                    nodeRootUrl,
                );
                const propertyNodeId = String(propertyNodeUrl);
                return propertyNodeId;
            });

            for (const propertyTypeNodeId of propertyTypeNodeIds) {
                yield {
                    type: "record",
                    minimumProperties,
                    maximumProperties,
                    requiredProperties,
                    propertyTypeNodeId,
                };
            }
        }
    }

    private * makeNodeCompoundDescriptorFromAllOf(
        node: Schema,
        nodeRootUrl: URL,
        nodePointer: string,
    ): Iterable<CompoundDescriptorUnion> {
        const allOf = [...selectSubNodeAllOfEntries(nodePointer, node)];
        if (allOf.length > 0) {
            const typeNodeIds = allOf.map(([typeNodePointer]) => {
                const typeNodeUrl = new URL(
                    `#${typeNodePointer}`,
                    nodeRootUrl,
                );
                const typeNodeId = String(typeNodeUrl);
                return typeNodeId;
            });

            yield {
                type: "all-of",
                typeNodeIds,
            };
        }
    }

    private * makeNodeCompoundDescriptorFromAnyOf(
        node: Schema,
        nodeRootUrl: URL,
        nodePointer: string,
    ): Iterable<CompoundDescriptorUnion> {
        const allOf = [...selectSubNodeAnyOfEntries(nodePointer, node)];
        if (allOf.length > 0) {
            const typeNodeIds = allOf.map(([typeNodePointer]) => {
                const typeNodeUrl = new URL(
                    `#${typeNodePointer}`,
                    nodeRootUrl,
                );
                const typeNodeId = String(typeNodeUrl);
                return typeNodeId;
            });

            yield {
                type: "any-of",
                typeNodeIds,
            };
        }
    }

    private * makeNodeCompoundDescriptorFromOneOf(
        node: Schema,
        nodeRootUrl: URL,
        nodePointer: string,
    ): Iterable<CompoundDescriptorUnion> {
        const allOf = [...selectSubNodeOneOfEntries(nodePointer, node)];
        if (allOf.length > 0) {
            const typeNodeIds = allOf.map(([typeNodePointer]) => {
                const typeNodeUrl = new URL(
                    `#${typeNodePointer}`,
                    nodeRootUrl,
                );
                const typeNodeId = String(typeNodeUrl);
                return typeNodeId;
            });

            yield {
                type: "one-of",
                typeNodeIds,
            };
        }
    }

    //#endregion

    //#region references

    private resolveReferenceNodeId(nodeId: string, nodeRef: string) {
        const nodeItem = this.getNodeItem(nodeId);

        const nodeRootId = String(nodeItem.nodeRootUrl);
        const nodeRetrievalUrl = this.context.getNodeRetrievalUrl(nodeRootId);

        const nodeRefRetrievalUrl = new URL(nodeRef, nodeRetrievalUrl);
        let hash = nodeRefRetrievalUrl.hash;
        // eslint-disable-next-line security/detect-possible-timing-attacks
        if (hash === "") {
            hash = "#";
        }
        nodeRefRetrievalUrl.hash = "";
        const nodeRefRetrievalId = String(nodeRefRetrievalUrl);
        const nodeRefRootUrl = this.context.getNodeRootUrl(nodeRefRetrievalId);

        const resolvedNodeUrl = new URL(hash, nodeRefRootUrl);
        const resolvedNodeId = String(resolvedNodeUrl);

        return resolvedNodeId;

    }

    //#endregion

}
