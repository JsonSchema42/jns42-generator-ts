import ts from "typescript";
import { SchemaCodeGeneratorBase } from "./code-generator.js";

export abstract class SchemaTypeCodeGeneratorBase extends SchemaCodeGeneratorBase {
    protected abstract getComments(nodeId: string): string

    protected generateNullTypeDefinition(
        factory: ts.NodeFactory,
        nodeId: string,
    ): ts.TypeNode {
        return factory.createLiteralTypeNode(
            factory.createNull(),
        );
    }
    protected abstract generateArrayTypeDefinition(
        factory: ts.NodeFactory,
        nodeId: string
    ): ts.TypeNode
    protected abstract generateObjectTypeDefinition(
        factory: ts.NodeFactory,
        nodeId: string
    ): ts.TypeNode
    protected generateStringTypeDefinition(
        factory: ts.NodeFactory,
        nodeId: string,
    ): ts.TypeNode {
        return factory.createKeywordTypeNode(
            ts.SyntaxKind.StringKeyword,
        );
    }
    protected generateNumberTypeDefinition(
        factory: ts.NodeFactory,
        nodeId: string,
    ): ts.TypeNode {
        return factory.createKeywordTypeNode(
            ts.SyntaxKind.NumberKeyword,
        );
    }
    protected generateIntegerTypeDefinition(
        factory: ts.NodeFactory,
        nodeId: string,
    ): ts.TypeNode {
        return this.generateNumberTypeDefinition(
            factory,
            nodeId,
        );
    }
    protected generateBooleanTypeDefinition(
        factory: ts.NodeFactory,
        nodeId: string,
    ): ts.TypeNode {
        return factory.createKeywordTypeNode(
            ts.SyntaxKind.BooleanKeyword,
        );
    }

    protected abstract generateTypeNodes(
        factory: ts.NodeFactory,
        nodeId: string,
    ): Iterable<ts.TypeNode>;

    public *generateStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ) {
        const typeName = this.manager.getName(nodeId);
        if (typeName == null) {
            throw new Error("typeName not found");
        }

        yield this.generateSchemaTypeDeclarationStatement(
            factory,
            nodeId,
            typeName,
        );

    }

    protected generateSchemaTypeDeclarationStatement(
        factory: ts.NodeFactory,
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
        nodeId: string,
    ): ts.TypeNode {
        const typeNodes = [...this.generateTypeNodes(factory, nodeId)];
        const node = typeNodes.length === 0 ?
            factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword) :
            factory.createParenthesizedType(factory.createIntersectionTypeNode(
                typeNodes,
            ));
        return node;
    }

    protected generateTypeDefinition(
        factory: ts.NodeFactory,
        nodeId: string,
        type: string,
    ): ts.TypeNode {
        switch (type) {
            case "null":
                return this.generateNullTypeDefinition(
                    factory,
                    nodeId,
                );

            case "array":
                return this.generateArrayTypeDefinition(
                    factory,
                    nodeId,
                );

            case "object":
                return this.generateObjectTypeDefinition(
                    factory,
                    nodeId,
                );

            case "string":
                return this.generateStringTypeDefinition(
                    factory,
                    nodeId,
                );

            case "number":
                return this.generateNumberTypeDefinition(
                    factory,
                    nodeId,
                );

            case "integer":
                return this.generateIntegerTypeDefinition(
                    factory,
                    nodeId,
                );

            case "boolean":
                return this.generateBooleanTypeDefinition(
                    factory,
                    nodeId,
                );

            default:
                throw new Error("type not supported");
        }
    }

    protected generateTypeReference(
        factory: ts.NodeFactory,
        nodeId: string,
    ) {
        const typeName = this.manager.getName(nodeId);
        if (typeName == null) {
            throw new Error("typeName not found");
        }
        return factory.createTypeReferenceNode(
            factory.createIdentifier(typeName),
        );
    }

}

