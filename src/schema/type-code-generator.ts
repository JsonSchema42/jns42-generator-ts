import ts from "typescript";
import { Namer } from "../utils/index.js";
import { SchemaCodeGeneratorBase } from "./code-generator.js";

export abstract class SchemaTypeCodeGeneratorBase extends SchemaCodeGeneratorBase {
    protected abstract getComments(nodeId: string): string

    protected generateNullTypeDefinition(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
    ): ts.TypeNode {
        return factory.createLiteralTypeNode(
            factory.createNull(),
        );
    }
    protected abstract generateArrayTypeDefinition(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string
    ): ts.TypeNode
    protected abstract generateObjectTypeDefinition(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string
    ): ts.TypeNode
    protected generateStringTypeDefinition(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
    ): ts.TypeNode {
        return factory.createKeywordTypeNode(
            ts.SyntaxKind.StringKeyword,
        );
    }
    protected generateNumberTypeDefinition(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
    ): ts.TypeNode {
        return factory.createKeywordTypeNode(
            ts.SyntaxKind.NumberKeyword,
        );
    }
    protected generateIntegerTypeDefinition(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
    ): ts.TypeNode {
        return this.generateNumberTypeDefinition(
            factory,
            namer,
            nodeId,
        );
    }
    protected generateBooleanTypeDefinition(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
    ): ts.TypeNode {
        return factory.createKeywordTypeNode(
            ts.SyntaxKind.BooleanKeyword,
        );
    }

    protected abstract generateTypeNodes(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
    ): Iterable<ts.TypeNode>;

    public *generateStatements(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
    ) {
        const typeName = namer.getName(nodeId).join("_");

        yield this.generateSchemaTypeDeclarationStatement(
            factory,
            namer,
            nodeId,
            typeName,
        );

    }

    protected generateSchemaTypeDeclarationStatement(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
        typeName: string,
    ) {
        const declaration = factory.createTypeAliasDeclaration(
            [
                factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            typeName,
            undefined,
            this.generateTypeNode(
                factory,
                namer,
                nodeId,
            ),
        );

        const comments = this.getComments(nodeId);
        if (comments.length > 0) {
            ts.addSyntheticLeadingComment(
                declaration,
                ts.SyntaxKind.MultiLineCommentTrivia,
                "*\n" + this.getComments(nodeId),
                true,
            );
        }

        return declaration;
    }

    protected generateTypeNode(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
    ): ts.TypeNode {
        const typeNodes = [...this.generateTypeNodes(factory, namer, nodeId)];
        const node = typeNodes.length === 0 ?
            factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword) :
            factory.createParenthesizedType(factory.createIntersectionTypeNode(
                typeNodes,
            ));
        return node;
    }

    protected generateTypeDefinition(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
        type: string,
    ): ts.TypeNode {
        switch (type) {
            case "null":
                return this.generateNullTypeDefinition(
                    factory,
                    namer,
                    nodeId,
                );

            case "array":
                return this.generateArrayTypeDefinition(
                    factory,
                    namer,
                    nodeId,
                );

            case "object":
                return this.generateObjectTypeDefinition(
                    factory,
                    namer,
                    nodeId,
                );

            case "string":
                return this.generateStringTypeDefinition(
                    factory,
                    namer,
                    nodeId,
                );

            case "number":
                return this.generateNumberTypeDefinition(
                    factory,
                    namer,
                    nodeId,
                );

            case "integer":
                return this.generateIntegerTypeDefinition(
                    factory,
                    namer,
                    nodeId,
                );

            case "boolean":
                return this.generateBooleanTypeDefinition(
                    factory,
                    namer,
                    nodeId,
                );

            default:
                throw new Error("type not supported");
        }
    }

    protected generateTypeReference(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
    ) {
        const typeName = namer.getName(nodeId).join("_");
        return factory.createTypeReferenceNode(
            factory.createIdentifier(typeName),
        );
    }

}

