import ts from "typescript";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class ValidatorsTsCodeGenerator extends CodeGeneratorBase {

    public * getStatements(nodeId: string) {
        const { factory: f } = this;

        yield f.createExpressionStatement(f.createCallExpression(
            f.createIdentifier("test"),
            undefined,
            [
                f.createStringLiteral("examples-valid"),
                f.createArrowFunction(
                    undefined,
                    undefined,
                    [f.createParameterDeclaration(
                        undefined,
                        undefined,
                        f.createIdentifier("t"),
                        undefined,
                        undefined,
                        undefined,
                    )],
                    undefined,
                    f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    f.createBlock([
                        ...this.generateTestValidStatements(nodeId),
                    ], true),
                ),
            ],
        ));

        yield f.createExpressionStatement(f.createCallExpression(
            f.createIdentifier("test"),
            undefined,
            [
                f.createStringLiteral("examples-invalid"),
                f.createArrowFunction(
                    undefined,
                    undefined,
                    [f.createParameterDeclaration(
                        undefined,
                        undefined,
                        f.createIdentifier("t"),
                        undefined,
                        undefined,
                        undefined,
                    )],
                    undefined,
                    f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    f.createBlock([
                        ...this.generateTestInvalidStatements(nodeId),
                    ], true),
                ),
            ],
        ));

    }

    public * generateTestValidStatements(
        nodeId: string,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        const name = this.namer.getName(nodeId).join("_");

        yield f.createVariableStatement(
            undefined,
            f.createVariableDeclarationList([
                f.createVariableDeclaration(
                    f.createIdentifier("directoryPath"),
                    undefined,
                    undefined,
                    f.createCallExpression(
                        f.createPropertyAccessExpression(
                            f.createIdentifier("path"),
                            f.createIdentifier("join"),
                        ),
                        undefined,
                        [
                            f.createStringLiteral("examples"),
                            f.createStringLiteral("valid"),
                        ],
                    ),
                ),
            ], ts.NodeFlags.Const),
        );

        yield f.createForOfStatement(
            undefined,
            f.createVariableDeclarationList([
                f.createVariableDeclaration(
                    f.createIdentifier("fileName"),
                    undefined,
                    undefined,
                    undefined,
                ),
            ], ts.NodeFlags.Const),

            f.createCallExpression(
                f.createPropertyAccessExpression(
                    f.createIdentifier("fs"),
                    f.createIdentifier("readdirSync"),
                ),
                undefined,
                [f.createIdentifier("directoryPath")],
            ),

            f.createBlock([
                f.createVariableStatement(
                    undefined,
                    f.createVariableDeclarationList([
                        f.createVariableDeclaration(
                            f.createIdentifier("filePath"),
                            undefined,
                            undefined,
                            f.createCallExpression(
                                f.createPropertyAccessExpression(
                                    f.createIdentifier("path"),
                                    f.createIdentifier("join"),
                                ),
                                undefined,
                                [
                                    f.createIdentifier("directoryPath"),
                                    f.createIdentifier("fileName"),
                                ],
                            ),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                f.createVariableStatement(
                    undefined,
                    f.createVariableDeclarationList([
                        f.createVariableDeclaration(
                            f.createIdentifier("fileContent"),
                            undefined,
                            undefined,
                            f.createCallExpression(
                                f.createPropertyAccessExpression(
                                    f.createIdentifier("fs"),
                                    f.createIdentifier("readFileSync"),
                                ),
                                undefined,
                                [
                                    f.createIdentifier("filePath"),
                                    f.createStringLiteral("utf-8"),
                                ],
                            ),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                f.createVariableStatement(
                    undefined,
                    f.createVariableDeclarationList([
                        f.createVariableDeclaration(
                            f.createIdentifier("instance"),
                            undefined,
                            undefined,
                            f.createAsExpression(
                                f.createCallExpression(
                                    f.createPropertyAccessExpression(
                                        f.createIdentifier("JSON"),
                                        f.createIdentifier("parse"),
                                    ),
                                    undefined,
                                    [f.createIdentifier("fileContent")],
                                ),
                                f.createTypeReferenceNode(f.createQualifiedName(
                                    f.createIdentifier("types"),
                                    f.createIdentifier(name),
                                )),
                            ),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                f.createVariableStatement(
                    undefined,
                    f.createVariableDeclarationList([
                        f.createVariableDeclaration(
                            f.createIdentifier("errors"),
                            undefined,
                            undefined,
                            f.createArrayLiteralExpression([
                                f.createSpreadElement(f.createCallExpression(
                                    f.createPropertyAccessExpression(
                                        f.createIdentifier("validators"),
                                        f.createIdentifier(`validate${name}`),
                                    ),
                                    undefined,
                                    [f.createIdentifier("instance")],
                                )),
                            ], false),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                f.createExpressionStatement(f.createCallExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("assert"),
                        f.createIdentifier("deepStrictEqual"),
                    ),
                    undefined,
                    [
                        f.createIdentifier("errors"),
                        f.createArrayLiteralExpression([]),
                        f.createTemplateExpression(
                            f.createTemplateHead(
                                "assertion failed for ",
                                "assertion failed for ",
                            ),
                            [f.createTemplateSpan(
                                f.createIdentifier("fileName"),
                                f.createTemplateTail(
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
        nodeId: string,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        const name = this.namer.getName(nodeId).join("_");

        yield f.createVariableStatement(
            undefined,
            f.createVariableDeclarationList([
                f.createVariableDeclaration(
                    f.createIdentifier("directoryPath"),
                    undefined,
                    undefined,
                    f.createCallExpression(
                        f.createPropertyAccessExpression(
                            f.createIdentifier("path"),
                            f.createIdentifier("join"),
                        ),
                        undefined,
                        [
                            f.createStringLiteral("examples"),
                            f.createStringLiteral("invalid"),
                        ],
                    ),
                ),
            ], ts.NodeFlags.Const),
        );

        yield f.createForOfStatement(
            undefined,
            f.createVariableDeclarationList([
                f.createVariableDeclaration(
                    f.createIdentifier("fileName"),
                    undefined,
                    undefined,
                    undefined,
                ),
            ], ts.NodeFlags.Const),
            f.createCallExpression(
                f.createPropertyAccessExpression(
                    f.createIdentifier("fs"),
                    f.createIdentifier("readdirSync"),
                ),
                undefined,
                [f.createIdentifier("directoryPath")],
            ),
            f.createBlock([
                f.createVariableStatement(
                    undefined,
                    f.createVariableDeclarationList([
                        f.createVariableDeclaration(
                            f.createIdentifier("filePath"),
                            undefined,
                            undefined,
                            f.createCallExpression(
                                f.createPropertyAccessExpression(
                                    f.createIdentifier("path"),
                                    f.createIdentifier("join"),
                                ),
                                undefined,
                                [
                                    f.createIdentifier("directoryPath"),
                                    f.createIdentifier("fileName"),
                                ],
                            ),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                f.createVariableStatement(
                    undefined,
                    f.createVariableDeclarationList(
                        [f.createVariableDeclaration(
                            f.createIdentifier("fileContent"),
                            undefined,
                            undefined,
                            f.createCallExpression(
                                f.createPropertyAccessExpression(
                                    f.createIdentifier("fs"),
                                    f.createIdentifier("readFileSync"),
                                ),
                                undefined,
                                [
                                    f.createIdentifier("filePath"),
                                    f.createStringLiteral("utf-8"),
                                ],
                            ),
                        )],
                        ts.NodeFlags.Const,
                    ),
                ),
                f.createVariableStatement(
                    undefined,
                    f.createVariableDeclarationList([
                        f.createVariableDeclaration(
                            f.createIdentifier("instance"),
                            undefined,
                            undefined,
                            f.createAsExpression(
                                f.createCallExpression(
                                    f.createPropertyAccessExpression(
                                        f.createIdentifier("JSON"),
                                        f.createIdentifier("parse"),
                                    ),
                                    undefined,
                                    [f.createIdentifier("fileContent")],
                                ),
                                f.createTypeReferenceNode(f.createQualifiedName(
                                    f.createIdentifier("types"),
                                    f.createIdentifier(name),
                                )),
                            ),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                f.createVariableStatement(
                    undefined,
                    f.createVariableDeclarationList([
                        f.createVariableDeclaration(
                            f.createIdentifier("errors"),
                            undefined,
                            undefined,
                            f.createArrayLiteralExpression([
                                f.createSpreadElement(f.createCallExpression(
                                    f.createPropertyAccessExpression(
                                        f.createIdentifier("validators"),
                                        f.createIdentifier(`validate${name}`),
                                    ),
                                    undefined,
                                    [f.createIdentifier("instance")],
                                )),
                            ], false),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                f.createExpressionStatement(f.createCallExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("assert"),
                        f.createIdentifier("notDeepStrictEqual"),
                    ),
                    undefined,
                    [
                        f.createIdentifier("errors"),
                        f.createArrayLiteralExpression([]),
                        f.createTemplateExpression(
                            f.createTemplateHead(
                                "assertion failed for ",
                                "assertion failed for ",
                            ),
                            [f.createTemplateSpan(
                                f.createIdentifier("fileName"),
                                f.createTemplateTail(
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
