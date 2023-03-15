import ts from "typescript";
import { SchemaNodeIndexItem } from "./schema-indexer.js";
import { SchemaTypeNameItem } from "./schema-namer.js";
import { selectNodeAllOfEntries, selectNodeAnyOfEntries, selectNodeDynamicRefUrl, selectNodeItemEntries, selectNodeOneOfEntries, selectNodePrefixItemEntries, selectNodePropertyEntries, selectNodeRefUrl, selectNodeRequiredProperties, selectNodeType } from "./selectors/node.js";

export function* generateTypes(
    factory: ts.NodeFactory,
    schemaNodeIndex: Map<string, SchemaNodeIndexItem>,
    schemaTypeItemIndex: Map<string, SchemaTypeNameItem>,
) {
    for (const schemaTypeItem of schemaTypeItemIndex.values()) {
        yield generateType(
            factory,
            schemaNodeIndex,
            schemaTypeItemIndex,
            schemaTypeItem,
        );
    }
}

function generateType(
    factory: ts.NodeFactory,
    schemaNodeIndex: Map<string, SchemaNodeIndexItem>,
    schemaTypeItemIndex: Map<string, SchemaTypeNameItem>,
    schemaTypeItem: SchemaTypeNameItem,
) {
    const nodeKey = String(schemaTypeItem.nodeUrl);

    const schemaNodeItem = schemaNodeIndex.get(nodeKey);
    if (schemaNodeItem == null) {
        throw new Error("node not found");
    }
    const { node, nodeUrl } = schemaNodeItem;

    const anyOfEntries = [...selectNodeAnyOfEntries(nodeUrl, node)];
    if (anyOfEntries.length > 0) {
        return factory.createTypeAliasDeclaration(
            [
                factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            schemaTypeItem.name,
            undefined,
            factory.createUnionTypeNode(
                anyOfEntries.map(([nodeUrl]) => generateTypeReference(
                    factory,
                    schemaTypeItemIndex,
                    nodeUrl,
                )),
            ),
        );
    }

    const oneOfEntries = [...selectNodeOneOfEntries(nodeUrl, node)];
    if (oneOfEntries.length > 0) {
        return factory.createTypeAliasDeclaration(
            [
                factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            schemaTypeItem.name,
            undefined,
            factory.createUnionTypeNode(
                oneOfEntries.map(([nodeUrl]) => generateTypeReference(
                    factory,
                    schemaTypeItemIndex,
                    nodeUrl,
                )),
            ),
        );
    }

    const allOfEntries = [...selectNodeAllOfEntries(nodeUrl, node)];
    if (allOfEntries.length > 0) {
        return factory.createTypeAliasDeclaration(
            [
                factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            schemaTypeItem.name,
            undefined,
            factory.createIntersectionTypeNode(
                allOfEntries.map(([nodeUrl]) => generateTypeReference(
                    factory,
                    schemaTypeItemIndex,
                    nodeUrl,
                )),
            ),
        );
    }

    const nodeRefUrl = selectNodeRefUrl(nodeUrl, node);
    if (nodeRefUrl != null) {
        return factory.createTypeAliasDeclaration(
            [
                factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            schemaTypeItem.name,
            undefined,
            generateTypeReference(factory, schemaTypeItemIndex, nodeRefUrl),
        );
    }

    const nodeDynamicRefUrl = selectNodeDynamicRefUrl(nodeUrl, node);
    if (nodeDynamicRefUrl != null) {
        const resolvedUrl = resolveDynamicReference(schemaNodeIndex, nodeDynamicRefUrl);
        return factory.createTypeAliasDeclaration(
            [
                factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            schemaTypeItem.name,
            undefined,
            generateTypeReference(factory, schemaTypeItemIndex, resolvedUrl),
        );
    }

    const types = selectNodeType(node);
    if (types == null) {
        return factory.createTypeAliasDeclaration(
            [
                factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            schemaTypeItem.name,
            undefined,
            factory.createKeywordTypeNode(
                ts.SyntaxKind.UnknownKeyword,
            ),
        );
    }

    return factory.createTypeAliasDeclaration(
        [
            factory.createToken(ts.SyntaxKind.ExportKeyword),
        ],
        schemaTypeItem.name,
        undefined,
        factory.createUnionTypeNode(
            types.map(type => generateTypeDefinition(
                factory,
                schemaTypeItemIndex,
                type,
                nodeUrl,
                node,
            )),
        ),
    );
}

function generateTypeReference(
    factory: ts.NodeFactory,
    schemaTypeItemIndex: Map<string, SchemaTypeNameItem>,
    nodeUrl: URL,
): ts.TypeNode {
    const nodeKey = String(nodeUrl);
    const schemaTypeItem = schemaTypeItemIndex.get(nodeKey);
    if (schemaTypeItem == null) {
        return factory.createKeywordTypeNode(
            ts.SyntaxKind.UnknownKeyword,
        );
    }
    return factory.createTypeReferenceNode(schemaTypeItem.name);
}

function generateTypeDefinition(
    factory: ts.NodeFactory,
    schemaTypeItemIndex: Map<string, SchemaTypeNameItem>,
    type: string,
    nodeUrl: URL,
    node: unknown,
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
            return generateObjectTypeDefinition(
                factory,
                schemaTypeItemIndex,
                nodeUrl,
                node,
            );

        case "array":
            return generateArrayTypeDefinition(
                factory,
                schemaTypeItemIndex,
                nodeUrl,
                node,
            );

        default:
            throw new Error("type not supported");

    }
}

function generateObjectTypeDefinition(
    factory: ts.NodeFactory,
    schemaTypeItemIndex: Map<string, SchemaTypeNameItem>,
    nodeUrl: URL,
    node: unknown,
): ts.TypeNode {
    const properties = [...selectNodePropertyEntries(nodeUrl, node)];
    const requiredProperties = new Set(selectNodeRequiredProperties(node) ?? []);

    return factory.createTypeLiteralNode(properties.map(
        ([nodeUrl, node, key]) => factory.createPropertySignature(
            undefined,
            key,
            requiredProperties.has(key) ?
                undefined :
                factory.createToken(ts.SyntaxKind.QuestionToken),
            generateTypeReference(factory, schemaTypeItemIndex, nodeUrl),
        )),
    );
}

function generateArrayTypeDefinition(
    factory: ts.NodeFactory,
    schemaTypeItemIndex: Map<string, SchemaTypeNameItem>,
    nodeUrl: URL,
    node: unknown,
): ts.TypeNode {
    const prefixItemEntries = [...selectNodePrefixItemEntries(
        nodeUrl,
        node,
    )];

    const itemEntries = [...selectNodeItemEntries(
        nodeUrl,
        node,
    )];

    if (itemEntries.length === 1) {
        const [itemNodeUrl, itemNode] = itemEntries[0];
        return factory.createTypeReferenceNode(
            "Array",
            [
                generateTypeReference(factory, schemaTypeItemIndex, itemNodeUrl),
            ],
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

function resolveDynamicReference(
    schemaNodeIndex: Map<string, SchemaNodeIndexItem>,
    nodeUrl: URL,
) {
    let schemaUrl = toServerUrl(nodeUrl);
    let schemaKey = String(schemaUrl);
    let schemaNodeItem = schemaNodeIndex.get(schemaKey);
    let outerNodeUrl = nodeUrl;

    while (schemaNodeItem != null && schemaNodeItem.referencingSchemaUrl != null) {
        schemaUrl = schemaNodeItem.referencingSchemaUrl;
        schemaKey = String(schemaUrl);
        schemaNodeItem = schemaNodeIndex.get(schemaKey);

        const maybeOuterNodeUrl = new URL(nodeUrl.hash, schemaUrl);
        const maybeOuterNodeKey = String(maybeOuterNodeUrl);
        const maybeOuterNodeItem = schemaNodeIndex.get(maybeOuterNodeKey);
        if (maybeOuterNodeItem != null) {
            outerNodeUrl = maybeOuterNodeItem.nodeUrl;
        }
    }

    return outerNodeUrl;
}

function toServerUrl(clientUrl: URL) {
    const serverUrl = new URL(clientUrl);
    serverUrl.hash = "";
    return serverUrl;
}
