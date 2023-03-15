import ts from "typescript";
import { SchemaCollection } from "./schema-collection.js";
import { SchemaIndexer, SchemaIndexerNodeItem } from "./schema-indexer.js";
import { SchemaNamer } from "./schema-namer.js";
import { selectNodeAllOfEntries, selectNodeAnyOfEntries, selectNodeDynamicRefUrl, selectNodeItemEntries, selectNodeOneOfEntries, selectNodePrefixItemEntries, selectNodePropertyEntries, selectNodeRefUrl, selectNodeRequiredProperties, selectNodeType } from "./selectors/node.js";

export class SchemaGenerator {
    constructor(
        private readonly factory: ts.NodeFactory,
        private readonly schemaCollection: SchemaCollection,
        private readonly schemaIndexer: SchemaIndexer,
        private readonly schemaNamer: SchemaNamer,
    ) {

    }

    *generateTypeDeclarations(): Iterable<ts.TypeAliasDeclaration> {
        for (const nodeItem of this.schemaIndexer.getNodeItems()) {
            yield this.generatTypeDeclaration(
                nodeItem,
            );
        }
    }

    generateTypeReference(
        nodeUrl: URL,
    ): ts.TypeNode {
        const typeName = this.schemaNamer.getName(nodeUrl);
        if (typeName == null) {
            throw new Error("typeName not found");
        }
        return this.factory.createTypeReferenceNode(typeName);
    }

    generatTypeDeclaration(nodeItem: SchemaIndexerNodeItem): ts.TypeAliasDeclaration {
        const typeName = this.schemaNamer.getName(nodeItem.nodeUrl);

        if (typeName == null) {
            throw new Error("typeName not found");
        }

        return this.factory.createTypeAliasDeclaration(
            [
                this.factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            typeName,
            undefined,
            this.generateTypeNode(nodeItem),
        );
    }

    generateTypeNode(nodeItem: SchemaIndexerNodeItem): ts.TypeNode {
        const nodeRefUrl = selectNodeRefUrl(nodeItem.nodeUrl, nodeItem.node);
        if (nodeRefUrl != null) {
            const resolvedUrl = this.resolveReference(nodeRefUrl);
            return this.generateTypeReference(resolvedUrl);
        }

        const nodeDynamicRefUrl = selectNodeDynamicRefUrl(nodeItem.nodeUrl, nodeItem.node);
        if (nodeDynamicRefUrl != null) {
            const resolvedUrl = this.resolveDynamicReference(nodeDynamicRefUrl);
            return this.generateTypeReference(resolvedUrl);
        }

        const anyOfEntries = [...selectNodeAnyOfEntries(nodeItem.nodeUrl, nodeItem.node)];
        if (anyOfEntries.length > 0) {
            return this.factory.createUnionTypeNode(
                anyOfEntries.map(([nodeUrl]) => this.generateTypeReference(
                    nodeUrl,
                )),
            );
        }

        const oneOfEntries = [...selectNodeOneOfEntries(nodeItem.nodeUrl, nodeItem.node)];
        if (oneOfEntries.length > 0) {
            return this.factory.createUnionTypeNode(
                oneOfEntries.map(([nodeUrl]) => this.generateTypeReference(
                    nodeUrl,
                )),
            );
        }

        const allOfEntries = [...selectNodeAllOfEntries(nodeItem.nodeUrl, nodeItem.node)];
        if (allOfEntries.length > 0) {
            return this.factory.createIntersectionTypeNode(
                allOfEntries.map(([nodeUrl]) => this.generateTypeReference(
                    nodeUrl,
                )),
            );
        }

        const types = selectNodeType(nodeItem.node);
        if (types == null) {
            return this.factory.createKeywordTypeNode(
                ts.SyntaxKind.UnknownKeyword,
            );
        }

        return this.factory.createUnionTypeNode(
            types.map(type => this.generateTypeDefinition(
                type,
                nodeItem,
            )),
        );
    }

    generateTypeDefinition(
        type: string,
        nodeItem: SchemaIndexerNodeItem,
    ): ts.TypeNode {

        switch (type) {
            case "null":
                return this.factory.createLiteralTypeNode(
                    this.factory.createNull(),
                );

            case "boolean":
                return this.factory.createKeywordTypeNode(
                    ts.SyntaxKind.BooleanKeyword,
                );

            case "number":
                return this.factory.createKeywordTypeNode(
                    ts.SyntaxKind.NumberKeyword,
                );

            case "integer":
                return this.factory.createKeywordTypeNode(
                    ts.SyntaxKind.NumberKeyword,
                );

            case "string":
                return this.factory.createKeywordTypeNode(
                    ts.SyntaxKind.StringKeyword,
                );

            case "object":
                return this.generateObjectTypeDefinition(
                    nodeItem,
                );

            case "array":
                return this.generateArrayTypeDefinition(
                    nodeItem,
                );

            default:
                throw new Error("type not supported");

        }
    }

    generateObjectTypeDefinition(
        nodeItem: SchemaIndexerNodeItem,
    ): ts.TypeNode {
        const properties = [...selectNodePropertyEntries(nodeItem.nodeUrl, nodeItem.node)];
        const requiredProperties = new Set(selectNodeRequiredProperties(nodeItem.node) ?? []);

        return this.factory.createTypeLiteralNode(properties.map(
            ([nodeUrl, node, key]) => this.factory.createPropertySignature(
                undefined,
                key,
                requiredProperties.has(key) ?
                    undefined :
                    this.factory.createToken(ts.SyntaxKind.QuestionToken),
                this.generateTypeReference(nodeUrl),
            )),
        );
    }

    generateArrayTypeDefinition(
        nodeItem: SchemaIndexerNodeItem,
    ): ts.TypeNode {
        const prefixItemEntries = [...selectNodePrefixItemEntries(
            nodeItem.nodeUrl,
            nodeItem.node,
        )];

        const itemEntries = [...selectNodeItemEntries(
            nodeItem.nodeUrl,
            nodeItem.node,
        )];

        if (itemEntries.length === 1) {
            const [itemNodeUrl, itemNode] = itemEntries[0];
            return this.factory.createTypeReferenceNode(
                "Array",
                [
                    this.generateTypeReference(itemNodeUrl),
                ],
            );
        }

        return this.factory.createTypeReferenceNode(
            "Array",
            [
                this.factory.createKeywordTypeNode(
                    ts.SyntaxKind.UnknownKeyword,
                ),
            ],
        );
    }

    resolveReference(
        nodeUrl: URL,
    ) {
        let resolvedUrl = this.schemaIndexer.getAnchorUrl(nodeUrl);

        if (resolvedUrl == null) {
            resolvedUrl = nodeUrl;
        }

        return resolvedUrl;
    }

    resolveDynamicReference(
        nodeUrl: URL,
    ) {
        let instanceUrl: URL | null = this.schemaIndexer.getInstanceUrl(nodeUrl) ?? null;
        let resolvedUrl = nodeUrl;

        while (instanceUrl != null) {
            const instanceItem = this.schemaCollection.getInstanceItem(instanceUrl);
            if (!instanceItem) {
                throw new Error("instanceItem not found");
            }

            const instanceRootUrl = this.schemaIndexer.getInstanceRootUrl(instanceUrl);
            const maybeResolvedUrl = this.schemaIndexer.getDynamicAnchorUrl(
                new URL(nodeUrl.hash, instanceRootUrl),
            );
            if (maybeResolvedUrl != null) {
                resolvedUrl = maybeResolvedUrl;
            }
            instanceUrl = instanceItem.referencingInstanceUrl;
        }

        return resolvedUrl;
    }

}
