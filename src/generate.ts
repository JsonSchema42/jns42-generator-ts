import ts from "typescript";
import { SchemaNodeIndexItem } from "./schema-indexer.js";
import { SchemaTypeNameItem } from "./schema-types.js";
import { selectNodeAllOfEntries, selectNodeAnyOfEntries, selectNodeOneOfEntries, selectNodeType } from "./selectors/node.js";

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
            types.map(type => generateTypeDefinitions(factory, type)),
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

function generateTypeDefinitions(
    factory: ts.NodeFactory,
    type: string,
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
            return factory.createKeywordTypeNode(
                ts.SyntaxKind.ObjectKeyword,
            );

        case "array":
            return factory.createTypeReferenceNode(
                "Array",
                [
                    factory.createKeywordTypeNode(
                        ts.SyntaxKind.AnyKeyword,
                    ),
                ],
            );

        default:
            throw new Error("type not supported");

    }
}
