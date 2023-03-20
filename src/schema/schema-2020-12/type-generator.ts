import ts from "typescript";
import { generatePrimitiveLiteral, pointerToHash } from "../../utils/index.js";
import { SchemaManager } from "../manager.js";
import { SchemaTypeGeneratorBase } from "../type-generator.js";
import { SchemaIndexer, SchemaIndexerNodeItem } from "./indexer.js";
import { SchemaLoader } from "./loader.js";
import { selectNodeAllOfEntries, selectNodeAnyOfEntries, selectNodeConst, selectNodeDynamicRef, selectNodeEnum, selectNodeOneOfEntries, selectNodeRef, selectNodeType } from "./selectors.js";

export class SchemaTypeGenerator extends SchemaTypeGeneratorBase {
    constructor(
        manager: SchemaManager,
        private readonly loader: SchemaLoader,
        private readonly indexer: SchemaIndexer,
    ) {
        super(manager);
    }

    public generateTypeDeclaration(
        factory: ts.NodeFactory,
        nodeId: string,
    ): ts.Statement {
        const typeName = this.manager.getName(nodeId);
        if (typeName == null) {
            throw new Error("typeName not found");
        }

        const nodeItem = this.indexer.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

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
        if (nodeItem.node === true) {
            return factory.createKeywordTypeNode(
                ts.SyntaxKind.AnyKeyword,
            );
        }

        if (nodeItem.node === false) {
            return factory.createKeywordTypeNode(
                ts.SyntaxKind.NeverKeyword,
            );
        }

        const nodeRef = selectNodeRef(nodeItem.node);
        if (nodeRef != null) {
            const nodeUrl = new URL(nodeRef, nodeItem.nodeBaseUrl);
            const nodeId = String(nodeUrl);
            const resolvedNodeId = this.resolveReferenceNodeId(nodeId);
            return this.generateTypeReference(
                factory,
                resolvedNodeId,
            );
        }

        const nodeDynamicRef = selectNodeDynamicRef(nodeItem.node);
        if (nodeDynamicRef != null) {
            const nodeUrl = new URL(nodeDynamicRef, nodeItem.nodeBaseUrl);
            const nodeId = String(nodeUrl);
            const resolvedNodeId = this.resolveDynamicReferenceNodeId(nodeId);
            return this.generateTypeReference(
                factory,
                resolvedNodeId,
            );
        }

        const constValue = selectNodeConst(nodeItem.node);
        if (constValue != null) {
            return factory.createLiteralTypeNode(generatePrimitiveLiteral(
                factory,
                constValue,
            ));
        }

        const enumValues = selectNodeEnum(nodeItem.node);
        if (enumValues != null) {
            return factory.createUnionTypeNode(
                enumValues.map(value => factory.createLiteralTypeNode(generatePrimitiveLiteral(
                    factory,
                    value,
                ))),
            );
        }

        const anyOfEntries = [...selectNodeAnyOfEntries(nodeItem.nodePointer, nodeItem.node)];
        if (anyOfEntries.length > 0) {
            return factory.createUnionTypeNode(
                anyOfEntries.map(([subNodePointer]) => {
                    const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeItem.nodeBaseUrl);
                    const subNodeId = String(subNodeUrl);
                    return this.generateTypeReference(
                        factory,
                        subNodeId,
                    );
                }),
            );
        }

        const oneOfEntries = [...selectNodeOneOfEntries(nodeItem.nodePointer, nodeItem.node)];
        if (oneOfEntries.length > 0) {
            return factory.createUnionTypeNode(
                oneOfEntries.map(([subNodePointer]) => {
                    const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeItem.nodeBaseUrl);
                    const subNodeId = String(subNodeUrl);
                    return this.generateTypeReference(
                        factory,
                        subNodeId,
                    );
                }),
            );
        }

        const allOfEntries = [...selectNodeAllOfEntries(nodeItem.nodePointer, nodeItem.node)];
        if (allOfEntries.length > 0) {
            return factory.createIntersectionTypeNode(
                allOfEntries.map(([subNodePointer]) => {
                    const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeItem.nodeBaseUrl);
                    const subNodeId = String(subNodeUrl);
                    return this.generateTypeReference(
                        factory,
                        subNodeId,
                    );
                }),
            );
        }

        const types = selectNodeType(nodeItem.node);
        if (types != null) {
            return factory.createUnionTypeNode(
                types.map(type => this.generateTypeDefinition(
                    factory,
                    type,
                    nodeItem,
                )),
            );
        }

        return factory.createKeywordTypeNode(
            ts.SyntaxKind.UnknownKeyword,
        );
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
                return factory.createKeywordTypeNode(
                    ts.SyntaxKind.NumberKeyword,
                );

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
        return factory.createTypeReferenceNode(
            "Array",
            [
                factory.createKeywordTypeNode(
                    ts.SyntaxKind.UnknownKeyword,
                ),
            ],
        );
    }

    private generateArrayTypeDefinition(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ): ts.TypeNode {
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
        let resolvedNodeId = this.indexer.getDynamicAnchorNodeId(nodeId);

        if (resolvedNodeId == null) {
            resolvedNodeId = nodeId;
        }

        return resolvedNodeId;
    }

}
