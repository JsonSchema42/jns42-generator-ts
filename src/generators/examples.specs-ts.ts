import ts from "typescript";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class ExamplesSpecsTsCodeGenerator extends CodeGeneratorBase {

    public * getStatements() {
        const { factory: f } = this;

        yield f.createImportDeclaration(
            undefined,
            f.createImportClause(
                false,
                f.createIdentifier("assert"),
                undefined,
            ),
            f.createStringLiteral("node:assert/strict"),
        );

        yield f.createImportDeclaration(
            undefined,
            f.createImportClause(
                false,
                f.createIdentifier("test"),
                undefined,
            ),
            f.createStringLiteral("node:test"),
        );

        yield f.createExpressionStatement(f.createCallExpression(
            f.createIdentifier("test"),
            undefined,
            [
                f.createStringLiteral("examples"),
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
                        //TODO
                    ], true),
                ),
            ],
        ));

    }

}
