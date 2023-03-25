import ts from "typescript";
import { SchemaCodeGeneratorBase } from "./code-generator.js";

export abstract class SchemaValidatorCodeGeneratorBase extends SchemaCodeGeneratorBase {

    protected abstract generateValidatorFunctionBodyStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ): Iterable<ts.Statement>;

    public *generateStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ) {
        const typeName = this.manager.getName(nodeId);
        if (typeName == null) {
            throw new Error("typeName not found");
        }

        yield this.generateValidatorFunctionDeclarationStatement(
            factory,
            nodeId,
            typeName,
        );
    }

    protected generateValidatorFunctionDeclarationStatement(
        factory: ts.NodeFactory,
        nodeId: string,
        typeName: string,
    ): ts.FunctionDeclaration {
        return factory.createFunctionDeclaration(
            [
                factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            factory.createToken(ts.SyntaxKind.AsteriskToken),
            `validate${typeName}`,
            undefined,
            [
                factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    "value",
                    undefined,
                    this.generateTypeReference(factory, nodeId),
                ),
                factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    "path",
                    undefined,
                    factory.createArrayTypeNode(
                        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    ),
                    factory.createArrayLiteralExpression([]),
                ),
            ],
            undefined,
            factory.createBlock(
                [...this.generateValidatorFunctionBodyStatements(factory, nodeId)],
                true,
            ),
        );
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

    protected wrapValidationExpression(
        factory: ts.NodeFactory,
        testExpression: ts.Expression,
    ) {
        return factory.createIfStatement(
            factory.createPrefixUnaryExpression(
                ts.SyntaxKind.ExclamationToken,
                testExpression,
            ),
            factory.createBlock([
                factory.createExpressionStatement(factory.createYieldExpression(
                    undefined,
                    factory.createIdentifier("path"),
                )),
            ]),
        );
    }

}

