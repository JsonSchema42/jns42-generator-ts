import ts from "typescript";
import { SchemaNodeIndexItem } from "./schema-indexer.js";
import { SchemaTypeNameItem } from "./schema-types.js";
import { selectNodeDereferencedUrl, selectNodeType } from "./selectors/node.js";

export function* generateTypes(
    factory: ts.NodeFactory,
    schemaTypeMap: Map<string, SchemaTypeNameItem>,
    schemaNodeIndex: Map<string, SchemaNodeIndexItem>,
) {
    for (const [nodeKey, typeItem] of schemaTypeMap) {
        const schemaNodeItem = schemaNodeIndex.get(nodeKey);
        if (schemaNodeItem == null) {
            throw new Error("node not found");
        }
        const { node, nodeUrl } = schemaNodeItem;

        const nodeDereferencedUrl = selectNodeDereferencedUrl(
            schemaNodeIndex,
            nodeUrl,
            node,
        );

        if (String(nodeDereferencedUrl) !== String(nodeUrl)) {
            const dereferencedTypeItem = schemaTypeMap.get(String(nodeDereferencedUrl));
            if (dereferencedTypeItem == null) {
                throw new Error("node not found");
            }
            yield factory.createTypeAliasDeclaration(
                [
                    factory.createToken(ts.SyntaxKind.ExportKeyword),
                ],
                typeItem.name,
                undefined,
                factory.createTypeReferenceNode(
                    dereferencedTypeItem.name,
                ),
            );
            continue;
        }

        const types = selectNodeType(node);
        if (types == null) {
            // throw new Error("no type");
            continue;
        }

        yield factory.createTypeAliasDeclaration(
            [
                factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            typeItem.name,
            undefined,
            factory.createUnionTypeNode(
                types.map(type => generateTypeDefinitions(factory, type)),
            ),
        );

    }
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
