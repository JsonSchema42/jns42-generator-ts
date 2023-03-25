import ts from "typescript";
import { SchemaCodeGeneratorBase } from "./code-generator.js";

export abstract class SchemaTypeCodeGeneratorBase extends SchemaCodeGeneratorBase {

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
        return factory.createTypeAliasDeclaration(
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
    }

    protected generateTypeNode(
        factory: ts.NodeFactory,
        nodeId: string,
    ): ts.TypeNode {
        const typeNodes = [...this.generateTypeNodes(factory, nodeId)];
        if (typeNodes.length === 0) {
            return factory.createKeywordTypeNode(
                ts.SyntaxKind.UnknownKeyword,
            );
        }
        return factory.createParenthesizedType(factory.createIntersectionTypeNode(
            typeNodes,
        ));
    }

    protected generateTypeReference(
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

