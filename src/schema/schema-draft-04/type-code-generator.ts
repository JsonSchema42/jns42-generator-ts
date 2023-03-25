import ts from "typescript";
import { generatePrimitiveLiteral } from "../../utils/index.js";
import { SchemaCodeGeneratorBase } from "../code-generator.js";
import { SchemaManager } from "../manager.js";
import { SchemaIndexer, SchemaIndexerNodeItem } from "./indexer.js";
import { SchemaLoader } from "./loader.js";
import { selectNodeAdditionalPropertiesEntries, selectNodeAllOfEntries, selectNodeAnyOfEntries, selectNodeEnum, selectNodeItemsEntries as selectNodeAdditionalItemsEntries, selectNodeItemsEntries, selectNodeOneOfEntries, selectNodeProperties, selectNodeRef, selectNodeRequiredProperties, selectNodeType } from "./selectors.js";

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
            const nodeUrl = new URL(nodeRef, nodeItem.nodeBaseUrl);
            const nodeId = String(nodeUrl);
            yield this.generateTypeReference(
                factory,
                nodeId,
            );
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
                        `#${subNodePointer}`,
                        nodeItem.nodeBaseUrl,
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
                        `#${subNodePointer}`,
                        nodeItem.nodeBaseUrl,
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
                        `#${subNodePointer}`,
                        nodeItem.nodeBaseUrl,
                    );
                    const subNodeId = String(subNodeUrl);
                    return this.generateTypeReference(
                        factory,
                        subNodeId,
                    );
                }),
            ));
        }

        const types = selectNodeType(nodeItem.node);
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
                `#${subNodePointer}`,
                nodeItem.nodeBaseUrl,
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

        const propertiesEntries = [...selectNodeProperties(nodeItem.nodePointer, nodeItem.node)];
        const propertiesSet = new Set(propertiesEntries.map(([name]) => name));
        const requiredPropertiesSet = new Set(selectNodeRequiredProperties(nodeItem.node));

        return factory.createTypeLiteralNode([
            ...propertiesEntries.map(
                ([propertyName, subNodePointer]) => {
                    const subNodeUrl = new URL(
                        `#${subNodePointer}`,
                        nodeItem.nodeBaseUrl,
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
            ...[...requiredPropertiesSet].
                filter(propertyName => !propertiesSet.has(propertyName)).
                map(propertyName => factory.createPropertySignature(
                    undefined,
                    propertyName,
                    undefined,
                    factory.createKeywordTypeNode(
                        ts.SyntaxKind.AnyKeyword,
                    ),
                )),
        ]);
    }

    private generateArrayTypeDefinition(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ): ts.TypeNode {
        const additionalItemsEntries = selectNodeAdditionalItemsEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );
        for (const [subNodePointer] of additionalItemsEntries) {
            const subNodeUrl = new URL(
                `#${subNodePointer}`,
                nodeItem.nodeBaseUrl,
            );
            const subNodeId = String(subNodeUrl);
            return factory.createTypeReferenceNode(
                "Array",
                [
                    this.generateTypeReference(factory, subNodeId),
                ],
            );
        }

        const itemsEntries = [...selectNodeItemsEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        )];

        if (itemsEntries.length > 0) {
            return factory.createTupleTypeNode(
                itemsEntries.map(
                    ([subNodePointer]) => {
                        const subNodeUrl = new URL(
                            `#${subNodePointer}`,
                            nodeItem.nodeBaseUrl,
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

}

