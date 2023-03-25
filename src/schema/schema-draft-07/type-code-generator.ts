import ts from "typescript";
import { generatePrimitiveLiteral } from "../../utils/index.js";
import { SchemaManager } from "../manager.js";
import { SchemaTypeCodeGeneratorBase } from "../type-code-generator.js";
import { SchemaIndexer } from "./indexer.js";
import { SchemaLoader } from "./loader.js";
import { selectNodeAdditionalPropertiesEntries, selectNodeAllOfEntries, selectNodeAnyOfEntries, selectNodeEnum, selectNodeItemsEntries as selectNodeAdditionalItemsEntries, selectNodeItemsEntries, selectNodeOneOfEntries, selectNodeProperties, selectNodeRef, selectNodeRequiredProperties, selectNodeType } from "./selectors.js";

export class SchemaTypeCodeGenerator extends SchemaTypeCodeGeneratorBase {
    constructor(
        manager: SchemaManager,
        private readonly loader: SchemaLoader,
        private readonly indexer: SchemaIndexer,
    ) {
        super(manager);
    }

    protected * generateTypeNodes(
        factory: ts.NodeFactory,
        nodeId: string,
    ): Iterable<ts.TypeNode> {
        const nodeItem = this.indexer.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

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
            const nodeUrl = new URL(nodeRef, nodeItem.nodeRootUrl);
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
                        `#${subNodePointer}`,
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
                        `#${subNodePointer}`,
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

        const types = selectNodeType(nodeItem.node);
        if (types != null) {
            yield factory.createParenthesizedType(factory.createUnionTypeNode(
                types.map(type => this.generateTypeDefinition(
                    factory,
                    nodeId,
                    type,
                )),
            ));
        }

    }

    protected generateObjectTypeDefinition(
        factory: ts.NodeFactory,
        nodeId: string,
    ): ts.TypeNode {
        const nodeItem = this.indexer.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

        const additionalPropertiesEntries = selectNodeAdditionalPropertiesEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );

        for (const [subNodePointer] of additionalPropertiesEntries) {
            const subNodeUrl = new URL(
                `#${subNodePointer}`,
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

        const propertiesEntries = [...selectNodeProperties(nodeItem.nodePointer, nodeItem.node)];
        const propertiesSet = new Set(propertiesEntries.map(([name]) => name));
        const requiredPropertiesSet = new Set(selectNodeRequiredProperties(nodeItem.node));

        return factory.createTypeLiteralNode([
            ...propertiesEntries.map(
                ([propertyName, subNodePointer]) => {
                    const subNodeUrl = new URL(
                        `#${subNodePointer}`,
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

    protected generateArrayTypeDefinition(
        factory: ts.NodeFactory,
        nodeId: string,
    ): ts.TypeNode {
        const nodeItem = this.indexer.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

        const additionalItemsEntries = selectNodeAdditionalItemsEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );
        for (const [subNodePointer] of additionalItemsEntries) {
            const subNodeUrl = new URL(
                `#${subNodePointer}`,
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

}

