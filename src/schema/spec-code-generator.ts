import ts from "typescript";
import { SchemaCodeGeneratorBase } from "./code-generator.js";

export abstract class SchemaSpecCodeGeneratorBase extends SchemaCodeGeneratorBase {
    public * generateStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ): Iterable<ts.Statement> {
        yield factory.createExpressionStatement(factory.createCallExpression(
            factory.createIdentifier("test"),
            undefined,
            [
                factory.createStringLiteral("examples-valid"),
                factory.createArrowFunction(
                    undefined,
                    undefined,
                    [factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        factory.createIdentifier("t"),
                        undefined,
                        undefined,
                        undefined,
                    )],
                    undefined,
                    factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    factory.createBlock(
                        [...this.generateTestValidStatements(factory, nodeId)],
                        true,
                    ),
                ),
            ],
        ));

        yield factory.createExpressionStatement(factory.createCallExpression(
            factory.createIdentifier("test"),
            undefined,
            [
                factory.createStringLiteral("examples-invalid"),
                factory.createArrowFunction(
                    undefined,
                    undefined,
                    [factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        factory.createIdentifier("t"),
                        undefined,
                        undefined,
                        undefined,
                    )],
                    undefined,
                    factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    factory.createBlock(
                        [...this.generateTestInvalidStatements(factory, nodeId)],
                        true,
                    ),
                ),
            ],
        ));

    }

    public * generateTestValidStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ): Iterable<ts.Statement> {
        const name = this.manager.getName(nodeId);
        if (name == null) {
            throw new Error("name not found");
        }

        yield factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList([
                factory.createVariableDeclaration(
                    factory.createIdentifier("directoryPath"),
                    undefined,
                    undefined,
                    factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                            factory.createIdentifier("path"),
                            factory.createIdentifier("join"),
                        ),
                        undefined,
                        [
                            factory.createStringLiteral("examples"),
                            factory.createStringLiteral("valid"),
                        ],
                    ),
                ),
            ], ts.NodeFlags.Const),
        );

        yield factory.createForOfStatement(
            undefined,
            factory.createVariableDeclarationList([
                factory.createVariableDeclaration(
                    factory.createIdentifier("fileName"),
                    undefined,
                    undefined,
                    undefined,
                ),
            ], ts.NodeFlags.Const),

            factory.createCallExpression(
                factory.createPropertyAccessExpression(
                    factory.createIdentifier("fs"),
                    factory.createIdentifier("readdirSync"),
                ),
                undefined,
                [factory.createIdentifier("directoryPath")],
            ),

            factory.createBlock([
                factory.createVariableStatement(
                    undefined,
                    factory.createVariableDeclarationList([
                        factory.createVariableDeclaration(
                            factory.createIdentifier("filePath"),
                            undefined,
                            undefined,
                            factory.createCallExpression(
                                factory.createPropertyAccessExpression(
                                    factory.createIdentifier("path"),
                                    factory.createIdentifier("join"),
                                ),
                                undefined,
                                [
                                    factory.createIdentifier("directoryPath"),
                                    factory.createIdentifier("fileName"),
                                ],
                            ),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                factory.createVariableStatement(
                    undefined,
                    factory.createVariableDeclarationList([
                        factory.createVariableDeclaration(
                            factory.createIdentifier("fileContent"),
                            undefined,
                            undefined,
                            factory.createCallExpression(
                                factory.createPropertyAccessExpression(
                                    factory.createIdentifier("fs"),
                                    factory.createIdentifier("readFileSync"),
                                ),
                                undefined,
                                [
                                    factory.createIdentifier("filePath"),
                                    factory.createStringLiteral("utf-8"),
                                ],
                            ),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                factory.createVariableStatement(
                    undefined,
                    factory.createVariableDeclarationList([
                        factory.createVariableDeclaration(
                            factory.createIdentifier("instance"),
                            undefined,
                            undefined,
                            factory.createAsExpression(
                                factory.createCallExpression(
                                    factory.createPropertyAccessExpression(
                                        factory.createIdentifier("JSON"),
                                        factory.createIdentifier("parse"),
                                    ),
                                    undefined,
                                    [factory.createIdentifier("fileContent")],
                                ),
                                factory.createTypeReferenceNode(factory.createQualifiedName(
                                    factory.createIdentifier("types"),
                                    factory.createIdentifier(name),
                                )),
                            ),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                factory.createVariableStatement(
                    undefined,
                    factory.createVariableDeclarationList([
                        factory.createVariableDeclaration(
                            factory.createIdentifier("errors"),
                            undefined,
                            undefined,
                            factory.createArrayLiteralExpression([
                                factory.createSpreadElement(factory.createCallExpression(
                                    factory.createPropertyAccessExpression(
                                        factory.createIdentifier("validators"),
                                        factory.createIdentifier(`validate${name}`),
                                    ),
                                    undefined,
                                    [factory.createIdentifier("instance")],
                                )),
                            ], false),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                factory.createExpressionStatement(factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("assert"),
                        factory.createIdentifier("deepStrictEqual"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("errors"),
                        factory.createArrayLiteralExpression([]),
                        factory.createTemplateExpression(
                            factory.createTemplateHead(
                                "assertion failed for ",
                                "assertion failed for ",
                            ),
                            [factory.createTemplateSpan(
                                factory.createIdentifier("fileName"),
                                factory.createTemplateTail(
                                    "",
                                    "",
                                ),
                            )],
                        ),
                    ],
                )),
            ], true),
        );
    }

    public * generateTestInvalidStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ): Iterable<ts.Statement> {
        const name = this.manager.getName(nodeId);
        if (name == null) {
            throw new Error("name not found");
        }

        yield factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList([
                factory.createVariableDeclaration(
                    factory.createIdentifier("directoryPath"),
                    undefined,
                    undefined,
                    factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                            factory.createIdentifier("path"),
                            factory.createIdentifier("join"),
                        ),
                        undefined,
                        [
                            factory.createStringLiteral("examples"),
                            factory.createStringLiteral("invalid"),
                        ],
                    ),
                ),
            ], ts.NodeFlags.Const),
        );

        yield factory.createForOfStatement(
            undefined,
            factory.createVariableDeclarationList([
                factory.createVariableDeclaration(
                    factory.createIdentifier("fileName"),
                    undefined,
                    undefined,
                    undefined,
                ),
            ], ts.NodeFlags.Const),
            factory.createCallExpression(
                factory.createPropertyAccessExpression(
                    factory.createIdentifier("fs"),
                    factory.createIdentifier("readdirSync"),
                ),
                undefined,
                [factory.createIdentifier("directoryPath")],
            ),
            factory.createBlock([
                factory.createVariableStatement(
                    undefined,
                    factory.createVariableDeclarationList([
                        factory.createVariableDeclaration(
                            factory.createIdentifier("filePath"),
                            undefined,
                            undefined,
                            factory.createCallExpression(
                                factory.createPropertyAccessExpression(
                                    factory.createIdentifier("path"),
                                    factory.createIdentifier("join"),
                                ),
                                undefined,
                                [
                                    factory.createIdentifier("directoryPath"),
                                    factory.createIdentifier("fileName"),
                                ],
                            ),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                factory.createVariableStatement(
                    undefined,
                    factory.createVariableDeclarationList(
                        [factory.createVariableDeclaration(
                            factory.createIdentifier("fileContent"),
                            undefined,
                            undefined,
                            factory.createCallExpression(
                                factory.createPropertyAccessExpression(
                                    factory.createIdentifier("fs"),
                                    factory.createIdentifier("readFileSync"),
                                ),
                                undefined,
                                [
                                    factory.createIdentifier("filePath"),
                                    factory.createStringLiteral("utf-8"),
                                ],
                            ),
                        )],
                        ts.NodeFlags.Const,
                    ),
                ),
                factory.createVariableStatement(
                    undefined,
                    factory.createVariableDeclarationList([
                        factory.createVariableDeclaration(
                            factory.createIdentifier("instance"),
                            undefined,
                            undefined,
                            factory.createAsExpression(
                                factory.createCallExpression(
                                    factory.createPropertyAccessExpression(
                                        factory.createIdentifier("JSON"),
                                        factory.createIdentifier("parse"),
                                    ),
                                    undefined,
                                    [factory.createIdentifier("fileContent")],
                                ),
                                factory.createTypeReferenceNode(factory.createQualifiedName(
                                    factory.createIdentifier("types"),
                                    factory.createIdentifier(name),
                                )),
                            ),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                factory.createVariableStatement(
                    undefined,
                    factory.createVariableDeclarationList([
                        factory.createVariableDeclaration(
                            factory.createIdentifier("errors"),
                            undefined,
                            undefined,
                            factory.createArrayLiteralExpression([
                                factory.createSpreadElement(factory.createCallExpression(
                                    factory.createPropertyAccessExpression(
                                        factory.createIdentifier("validators"),
                                        factory.createIdentifier(`validate${name}`),
                                    ),
                                    undefined,
                                    [factory.createIdentifier("instance")],
                                )),
                            ], false),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                factory.createExpressionStatement(factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("assert"),
                        factory.createIdentifier("notDeepStrictEqual"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("errors"),
                        factory.createArrayLiteralExpression([]),
                        factory.createTemplateExpression(
                            factory.createTemplateHead(
                                "assertion failed for ",
                                "assertion failed for ",
                            ),
                            [factory.createTemplateSpan(
                                factory.createIdentifier("fileName"),
                                factory.createTemplateTail(
                                    "",
                                    "",
                                ),
                            )],
                        ),
                    ],
                )),
            ], true),
        );
    }
}

