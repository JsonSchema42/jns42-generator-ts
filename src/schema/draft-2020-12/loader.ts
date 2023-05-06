import { CompoundDescriptorUnion } from "../index.js";
import { SchemaLoaderBase } from "../loader.js";
import { TypeDescriptorUnion } from "../type-descriptors.js";
import { metaSchemaId } from "./meta.js";
import { selectAllSubNodes, selectAllSubNodesAndSelf, selectNodeAnchor, selectNodeConst, selectNodeDeprecated, selectNodeDescription, selectNodeDynamicAnchor, selectNodeEnum, selectNodeId, selectNodePropertyNamesEntries, selectNodeRef, selectNodeSchema, selectNodeTypes, selectSubNodeAdditionalPropertiesEntries, selectSubNodeAllOfEntries, selectSubNodeAnyOfEntries, selectSubNodeItemsEntries, selectSubNodeOneOfEntries, selectSubNodePrefixItemsEntries, selectSubNodes, selectValidationMaximumExclusive, selectValidationMaximumInclusive, selectValidationMaximumItems, selectValidationMaximumLength, selectValidationMaximumProperties, selectValidationMinimumExclusive, selectValidationMinimumInclusive, selectValidationMinimumItems, selectValidationMinimumLength, selectValidationMinimumProperties, selectValidationMultipleOf, selectValidationRequired, selectValidationUniqueItems, selectValidationValuePattern } from "./selectors.js";
import { Schema } from "./types.js";
import { validateSchema } from "./validators.js";

export class SchemaLoader extends SchemaLoaderBase<Schema> {
    protected readonly metaSchemaId = metaSchemaId;

    public isSchemaRootNode(node: unknown): node is Schema {
        const schemaId = selectNodeSchema(node as any);
        if (schemaId == null) {
            return false;
        }
        return schemaId === this.metaSchemaId;
    }

    public validateSchema(node: Schema): boolean {
        for (const error of validateSchema(node, [])) {
            return false;
        }
        return true;
    }

    public *getReferencedNodeUrls(
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
            await this.manager.loadFromUrl(
                nodeRefUrl,
                retrievalRefUrl,
                nodeUrl,
                this.metaSchemaId,
            );
        }

    }

    private readonly anchorMap = new Map<string, string>();
    private readonly dynamicAnchorMap = new Map<string, string>();

    public getAnchorNodeId(nodeId: string) {
        return this.anchorMap.get(nodeId);
    }

    public getDynamicAnchorNodeId(nodeId: string) {
        return this.dynamicAnchorMap.get(nodeId);
    }

    public resolveReferenceNodeId(nodeId: string, nodeRef: string) {
        const nodeItem = this.getNodeItem(nodeId);

        const nodeRootId = String(nodeItem.nodeRootUrl);
        const nodeRetrievalUrl = this.manager.getNodeRetrievalUrl(nodeRootId);

        const nodeRefRetrievalUrl = new URL(nodeRef, nodeRetrievalUrl);
        const hash = nodeRefRetrievalUrl.hash;
        nodeRefRetrievalUrl.hash = "";
        const nodeRefRetrievalId = String(nodeRefRetrievalUrl);
        const nodeRefRootUrl = this.manager.getNodeRootUrl(nodeRefRetrievalId);

        const resolvedNodeUrl = new URL(hash, nodeRefRootUrl);
        let resolvedNodeId = String(resolvedNodeUrl);

        const anchorNodeId = this.getAnchorNodeId(resolvedNodeId);

        if (anchorNodeId != null) {
            resolvedNodeId = anchorNodeId;
        }

        return resolvedNodeId;

    }

    public resolveDynamicReferenceNodeId(nodeId: string, nodeDynamicRef: string) {
        const nodeItem = this.getNodeItem(nodeId);

        const nodeRootId = String(nodeItem.nodeRootUrl);
        const nodeRetrievalUrl = this.manager.getNodeRetrievalUrl(nodeRootId);

        const nodeRefRetrievalUrl = new URL(nodeDynamicRef, nodeRetrievalUrl);
        const hash = nodeRefRetrievalUrl.hash;
        nodeRefRetrievalUrl.hash = "";
        const nodeRefRetrievalId = String(nodeRefRetrievalUrl);
        const nodeRefRootUrl = this.manager.getNodeRootUrl(nodeRefRetrievalId);

        const resolvedNodeUrl = new URL(hash, nodeRefRootUrl);
        let resolvedNodeId = String(resolvedNodeUrl);

        let currentRootNodeUrl: URL | null = new URL("", resolvedNodeUrl);
        while (currentRootNodeUrl != null) {
            const currentRootNodeId = String(currentRootNodeUrl);
            const currentRootNode = this.getRootNodeItem(currentRootNodeId);

            const currentNodeUrl = new URL(
                hash,
                currentRootNode.nodeUrl,
            );
            const currentNodeId = String(currentNodeUrl);
            const dynamicAnchorNodeId = this.getDynamicAnchorNodeId(
                currentNodeId,
            );
            if (dynamicAnchorNodeId != null) {
                resolvedNodeId = dynamicAnchorNodeId;
            }

            currentRootNodeUrl = currentRootNode.referencingNodeUrl;
        }

        return resolvedNodeId;
    }

    /*
    override the super function to load dynamic anchors
    */
    protected * indexNode(
        node: Schema,
        nodeRootUrl: URL,
        nodePointer: string,
    ) {
        const nodeUrl = this.makeNodeUrl(
            node,
            nodeRootUrl,
            nodePointer,
        );
        const nodeId = String(nodeUrl);

        const nodeAnchor = selectNodeAnchor(node);
        if (nodeAnchor != null) {
            const anchorUrl = new URL(`#${nodeAnchor}`, nodeRootUrl);
            const anchorId = String(anchorUrl);
            if (this.anchorMap.has(anchorId)) {
                throw new Error("duplicate anchorId");
            }
            this.anchorMap.set(anchorId, nodeId);

            yield anchorUrl;
        }

        const nodeDynamicAnchor = selectNodeDynamicAnchor(node);
        if (nodeDynamicAnchor != null) {
            const dynamicAnchorUrl = new URL(`#${nodeDynamicAnchor}`, nodeRootUrl);
            const dynamicAnchorId = String(dynamicAnchorUrl);
            if (this.dynamicAnchorMap.has(dynamicAnchorId)) {
                throw new Error("duplicate dynamicAnchorId");
            }
            this.dynamicAnchorMap.set(dynamicAnchorId, nodeId);

            // TODO should wel yield this?
            // yield dynamicAnchorUrl;
        }

        yield* super.indexNode(
            node,
            nodeRootUrl,
            nodePointer,
        );
    }

    public getComments(nodeId: string): string {
        const nodeItem = this.getNodeItem(nodeId);

        const description = selectNodeDescription(nodeItem.node) ?? "";
        const deprecated = selectNodeDeprecated(nodeItem.node) ?? false;

        const lines = [
            description,
            deprecated ? "@deprecated" : "",
        ].
            map(line => line.trim()).
            filter(line => line.length > 0).
            map(line => line + "\n").
            join("");

        return lines;
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
        const enumValues = selectNodeEnum(node);
        const constValue = selectNodeConst(node);

        let options: Array<boolean> | undefined;

        if (constValue != null) {
            options = [constValue];
        }
        else if (enumValues != null) {
            options = [...enumValues];
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
        const enumValues = selectNodeEnum(node);
        const constValue = selectNodeConst(node);

        let options: Array<number> | undefined;

        if (constValue != null) {
            options = [constValue];
        }
        else if (enumValues != null) {
            options = [...enumValues];
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
        const enumValues = selectNodeEnum(node);
        const constValue = selectNodeConst(node);

        let options: Array<string> | undefined;

        if (constValue != null) {
            options = [constValue];
        }
        else if (enumValues != null) {
            options = [...enumValues];
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
        const items = [...selectSubNodeItemsEntries(nodePointer, node)];
        const prefixItems = [...selectSubNodePrefixItemsEntries(nodePointer, node)];
        const minimumItems = selectValidationMinimumItems(node);
        const maximumItems = selectValidationMaximumItems(node);
        const uniqueItems = selectValidationUniqueItems(node) ?? false;

        if (prefixItems.length > 0) {
            const itemTypeNodeIds = prefixItems.map(([itemNodePointer]) => {
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

        if (items.length > 0) {
            const itemTypeNodeIds = items.map(([itemNodePointer]) => {
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

        if (additionalProperties.length > 0) {
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

    public resolveNodeId(nodeId: string): string {
        throw new Error("Method not implemented.");
    }

}
