import ts from "typescript";
import { generatePrimitiveLiteral, pointerToHash } from "../../utils/index.js";
import { SchemaCodeGeneratorBase } from "../code-generator.js";
import { SchemaManager } from "../manager.js";
import { SchemaIndexer, SchemaIndexerNodeItem } from "./indexer.js";
import { SchemaLoader } from "./loader.js";
import { selectNodeAdditionalPropertiesEntries, selectNodeAllOfEntries, selectNodeAnyOfEntries, selectNodeConst, selectNodeDynamicRef, selectNodeEnum, selectNodeItemsEntries, selectNodeOneOfEntries, selectNodePrefixItemsEntries, selectNodePropertyNamesEntries, selectNodeRef, selectNodeRequiredPropertyNames, selectNodeTypes } from "./selectors.js";

export class SchemaTypeCodeGenerator extends SchemaCodeGeneratorBase {
    constructor(
        manager: SchemaManager,
        private readonly loader: SchemaLoader,
        private readonly indexer: SchemaIndexer,
    ) {
        super(manager);
    }

    public *generateStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ) {
        const typeName = this.manager.getName(nodeId);
        if (typeName == null) {
            throw new Error("typeName not found");
        }

        const nodeItem = this.indexer.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

        yield this.generateSchemaTypeDeclarationStatement(
            factory,
            nodeId,
            nodeItem,
            typeName,
        );

    }

    private generateSchemaTypeDeclarationStatement(
        factory: ts.NodeFactory,
        nodeId: string,
        nodeItem: SchemaIndexerNodeItem,
        typeName: string,
    ) {
        return factory.createTypeAliasDeclaration(
            [
                factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            typeName,
            undefined,
            this.generateTypeNode(
                factory,
                nodeItem,
            ),
        );
    }

    private generateTypeNode(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ): ts.TypeNode {
        const typeNodes = [...this.generateTypeNodes(factory, nodeItem)];
        if (typeNodes.length === 0) {
            return factory.createKeywordTypeNode(
                ts.SyntaxKind.UnknownKeyword,
            );
        }
        return factory.createParenthesizedType(factory.createIntersectionTypeNode(
            typeNodes,
        ));
    }

    private * generateTypeNodes(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ): Iterable<ts.TypeNode> {
        if (nodeItem.node === true) {
            yield factory.createKeywordTypeNode(
                ts.SyntaxKind.AnyKeyword,
            );
            return;
        }

        if (nodeItem.node === false) {
            yield factory.createKeywordTypeNode(
                ts.SyntaxKind.NeverKeyword,
            );
            return;
        }

        const nodeRef = selectNodeRef(nodeItem.node);
        if (nodeRef != null) {
            const nodeRootId = String(nodeItem.nodeRootUrl);
            const nodeRetrievalUrl = this.manager.getNodeRetrievalUrl(nodeRootId);

            const nodeRefRetrievalUrl = new URL(nodeRef, nodeRetrievalUrl);
            const nodeRefRetrievalId = String(nodeRefRetrievalUrl);
            const nodeRefRootUrl = this.manager.getNodeRootUrl(nodeRefRetrievalId);

            const nodeUrl = new URL(nodeRefRetrievalUrl.hash, nodeRefRootUrl);
            const nodeId = String(nodeUrl);
            const resolvedNodeId = this.resolveReferenceNodeId(nodeId);

            yield this.generateTypeReference(
                factory,
                resolvedNodeId,
            );
        }

        const nodeDynamicRef = selectNodeDynamicRef(nodeItem.node);
        if (nodeDynamicRef != null) {
            const nodeRootId = String(nodeItem.nodeRootUrl);
            const nodeRetrievalUrl = this.manager.getNodeRetrievalUrl(nodeRootId);

            const nodeRefRetrievalUrl = new URL(nodeDynamicRef, nodeRetrievalUrl);
            const nodeRefRetrievalId = String(nodeRefRetrievalUrl);
            const nodeRefRootUrl = this.manager.getNodeRootUrl(nodeRefRetrievalId);

            const nodeUrl = new URL(nodeRefRetrievalUrl.hash, nodeRefRootUrl);
            const nodeId = String(nodeUrl);
            const resolvedNodeId = this.resolveDynamicReferenceNodeId(nodeId);

            yield this.generateTypeReference(
                factory,
                resolvedNodeId,
            );
        }

        const constValue = selectNodeConst(nodeItem.node);
        if (constValue != null) {
            yield factory.createLiteralTypeNode(generatePrimitiveLiteral(
                factory,
                constValue,
            ));
        }

        const enumValues = selectNodeEnum(nodeItem.node);
        if (enumValues != null) {
            yield factory.createParenthesizedType(factory.createUnionTypeNode(
                enumValues.map(value => factory.createLiteralTypeNode(generatePrimitiveLiteral(
                    factory,
                    value,
                ))),
            ));
        }

        const anyOfEntries = [...selectNodeAnyOfEntries(nodeItem.nodePointer, nodeItem.node)];
        if (anyOfEntries.length > 0) {
            yield factory.createParenthesizedType(factory.createUnionTypeNode(
                anyOfEntries.map(([subNodePointer]) => {
                    const subNodeUrl = new URL(
                        pointerToHash(subNodePointer),
                        nodeItem.nodeRootUrl,
                    );
                    const subNodeId = String(subNodeUrl);
                    return this.generateTypeReference(
                        factory,
                        subNodeId,
                    );
                }),
            ));
        }

        const oneOfEntries = [...selectNodeOneOfEntries(nodeItem.nodePointer, nodeItem.node)];
        if (oneOfEntries.length > 0) {
            yield factory.createParenthesizedType(factory.createUnionTypeNode(
                oneOfEntries.map(([subNodePointer]) => {
                    const subNodeUrl = new URL(
                        pointerToHash(subNodePointer),
                        nodeItem.nodeRootUrl,
                    );
                    const subNodeId = String(subNodeUrl);
                    return this.generateTypeReference(
                        factory,
                        subNodeId,
                    );
                }),
            ));
        }

        const allOfEntries = [...selectNodeAllOfEntries(nodeItem.nodePointer, nodeItem.node)];
        if (allOfEntries.length > 0) {
            yield factory.createParenthesizedType(factory.createIntersectionTypeNode(
                allOfEntries.map(([subNodePointer]) => {
                    const subNodeUrl = new URL(
                        pointerToHash(subNodePointer),
                        nodeItem.nodeRootUrl,
                    );
                    const subNodeId = String(subNodeUrl);
                    return this.generateTypeReference(
                        factory,
                        subNodeId,
                    );
                }),
            ));
        }

        const types = selectNodeTypes(nodeItem.node);
        if (types != null) {
            yield factory.createParenthesizedType(factory.createUnionTypeNode(
                types.map(type => this.generateTypeDefinition(
                    factory,
                    type,
                    nodeItem,
                )),
            ));
        }

    }

    private generateTypeDefinition(
        factory: ts.NodeFactory,
        type: string,
        nodeItem: SchemaIndexerNodeItem,
    ): ts.TypeNode {
        switch (type) {
            case "null":
                return factory.createLiteralTypeNode(
                    factory.createNull(),
                );

            case "boolean":
                return factory.createKeywordTypeNode(
                    ts.SyntaxKind.BooleanKeyword,
                );

            case "number":
            case "integer":
                return factory.createKeywordTypeNode(
                    ts.SyntaxKind.NumberKeyword,
                );

            case "string":
                return factory.createKeywordTypeNode(
                    ts.SyntaxKind.StringKeyword,
                );

            case "object":
                return this.generateObjectTypeDefinition(
                    factory,
                    nodeItem,
                );

            case "array":
                return this.generateArrayTypeDefinition(
                    factory,
                    nodeItem,
                );

            default:
                throw new Error("type not supported");

        }
    }

    private generateObjectTypeDefinition(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ): ts.TypeNode {
        const additionalPropertiesEntries = selectNodeAdditionalPropertiesEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );

        for (const [subNodePointer] of additionalPropertiesEntries) {
            const subNodeUrl = new URL(
                pointerToHash(subNodePointer),
                nodeItem.nodeRootUrl,
            );
            const subNodeId = String(subNodeUrl);

            return factory.createTypeReferenceNode(
                "Record",
                [
                    factory.createKeywordTypeNode(
                        ts.SyntaxKind.StringKeyword,
                    ),
                    this.generateTypeReference(
                        factory,
                        subNodeId,
                    ),
                ],
            );
        }

        const propertiesEntries =
            [...selectNodePropertyNamesEntries(nodeItem.nodePointer, nodeItem.node)];
        const requiredPropertiesSet = new Set(selectNodeRequiredPropertyNames(nodeItem.node));

        return factory.createTypeLiteralNode([
            ...propertiesEntries.map(
                ([subNodePointer, propertyName]) => {
                    const subNodeUrl = new URL(
                        pointerToHash(subNodePointer),
                        nodeItem.nodeRootUrl,
                    );
                    const subNodeId = String(subNodeUrl);
                    return factory.createPropertySignature(
                        undefined,
                        propertyName,
                        requiredPropertiesSet.has(propertyName) ?
                            undefined :
                            factory.createToken(ts.SyntaxKind.QuestionToken),
                        this.generateTypeReference(
                            factory,
                            subNodeId,
                        ),
                    );
                },
            ),
        ]);
    }

    private generateArrayTypeDefinition(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ): ts.TypeNode {
        const itemsEntries = selectNodeItemsEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );
        for (const [subNodePointer] of itemsEntries) {
            const subNodeUrl = new URL(
                pointerToHash(subNodePointer),
                nodeItem.nodeRootUrl,
            );
            const subNodeId = String(subNodeUrl);
            return factory.createTypeReferenceNode(
                "Array",
                [
                    this.generateTypeReference(factory, subNodeId),
                ],
            );
        }

        const prefixItemsEntries = [...selectNodePrefixItemsEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        )];

        if (prefixItemsEntries.length > 0) {
            return factory.createTupleTypeNode(
                prefixItemsEntries.map(
                    ([subNodePointer]) => {
                        const subNodeUrl = new URL(
                            pointerToHash(subNodePointer),
                            nodeItem.nodeRootUrl,
                        );
                        const subNodeId = String(subNodeUrl);
                        return this.generateTypeReference(factory, subNodeId);
                    },
                ),
            );
        }

        return factory.createTypeReferenceNode(
            "Array",
            [
                factory.createKeywordTypeNode(
                    ts.SyntaxKind.UnknownKeyword,
                ),
            ],
        );
    }

    private generateTypeReference(
        factory: ts.NodeFactory,
        nodeId: string,
    ): ts.TypeNode {
        const typeName = this.manager.getName(nodeId);
        if (typeName == null) {
            throw new Error("typeName not found");
        }
        return factory.createTypeReferenceNode(typeName);
    }

    private resolveReferenceNodeId(
        nodeId: string,
    ) {
        let resolvedNodeId = this.indexer.getAnchorNodeId(nodeId);

        if (resolvedNodeId == null) {
            resolvedNodeId = nodeId;
        }

        return resolvedNodeId;
    }

    private resolveDynamicReferenceNodeId(
        nodeId: string,
    ) {
        const nodeUrl = new URL(nodeId);
        let resolvedNodeId: string | null = nodeId;
        let currentRootNodeUrl: URL | null = new URL("", nodeUrl);
        while (currentRootNodeUrl != null) {
            const currentRootNodeId = String(currentRootNodeUrl);
            const currentRootNode = this.loader.getRootNodeItem(currentRootNodeId);
            if (currentRootNode == null) {
                throw new Error("rootNode not found");
            }

            const currentNodeUrl = new URL(
                nodeUrl.hash,
                currentRootNode.nodeUrl,
            );
            const currentNodeId = String(currentNodeUrl);
            const maybeResolvedNodeId = this.indexer.getDynamicAnchorNodeId(
                currentNodeId,
            );
            if (maybeResolvedNodeId != null) {
                resolvedNodeId = maybeResolvedNodeId;
            }

            currentRootNodeUrl = currentRootNode.referencingNodeUrl;
        }

        return resolvedNodeId;
    }

}

