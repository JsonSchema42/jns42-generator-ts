import ts from "typescript";
import { generatePrimitiveLiteral } from "../../utils/index.js";
import { SchemaManager } from "../manager.js";
import { SchemaTypeCodeGeneratorBase } from "../type-code-generator.js";
import { SchemaIndexer } from "./indexer.js";
import { selectNodeAdditionalPropertiesEntries, selectNodeAllOfEntries, selectNodeAnyOfEntries, selectNodeConst, selectNodeDeprecated, selectNodeDescription, selectNodeDynamicRef, selectNodeEnum, selectNodeItemsEntries, selectNodeOneOfEntries, selectNodePrefixItemsEntries, selectNodePropertyNamesEntries, selectNodeRef, selectNodeRequiredPropertyNames, selectNodeTypes } from "./selectors.js";

export class SchemaTypeCodeGenerator extends SchemaTypeCodeGeneratorBase {
    constructor(
        manager: SchemaManager,
        private readonly indexer: SchemaIndexer,
    ) {
        super(manager);
    }

    protected getComments(nodeId: string): string {
        const nodeItem = this.indexer.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

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
            const resolvedNodeId = this.indexer.resolveReferenceNodeId(
                nodeId,
                nodeRef,
            );

            yield this.generateTypeReference(
                factory,
                resolvedNodeId,
            );
        }

        const nodeDynamicRef = selectNodeDynamicRef(nodeItem.node);
        if (nodeDynamicRef != null) {
            const resolvedNodeId = this.indexer.resolveDynamicReferenceNodeId(
                nodeId,
                nodeDynamicRef,
            );

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

        const types = selectNodeTypes(nodeItem.node);
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

        const propertiesEntries =
            [...selectNodePropertyNamesEntries(nodeItem.nodePointer, nodeItem.node)];
        const requiredPropertiesSet = new Set(selectNodeRequiredPropertyNames(nodeItem.node));

        return factory.createTypeLiteralNode([
            ...propertiesEntries.map(
                ([subNodePointer, propertyName]) => {
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

        const itemsEntries = selectNodeItemsEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );
        for (const [subNodePointer] of itemsEntries) {
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

        const prefixItemsEntries = [...selectNodePrefixItemsEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        )];

        if (prefixItemsEntries.length > 0) {
            return factory.createTupleTypeNode(
                prefixItemsEntries.map(
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

