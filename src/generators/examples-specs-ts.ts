import ts from "typescript";
import { generateLiteral } from "../utils/literal.js";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class ExamplesSpecsTsCodeGenerator extends CodeGeneratorBase {
    public *getStatements() {
        const { factory: f } = this;

        yield f.createImportDeclaration(
            undefined,
            f.createImportClause(
                false,
                f.createIdentifier("assert"),
                undefined
            ),
            f.createStringLiteral("node:assert/strict")
        );

        yield f.createImportDeclaration(
            undefined,
            f.createImportClause(false, f.createIdentifier("test"), undefined),
            f.createStringLiteral("node:test")
        );

        yield f.createImportDeclaration(
            undefined,
            f.createImportClause(
                false,
                undefined,
                f.createNamespaceImport(f.createIdentifier("validators"))
            ),
            f.createStringLiteral("./validators.js")
        );

        yield f.createExpressionStatement(
            f.createCallExpression(f.createIdentifier("test"), undefined, [
                f.createStringLiteral("examples"),
                f.createArrowFunction(
                    undefined,
                    undefined,
                    [
                        f.createParameterDeclaration(
                            undefined,
                            undefined,
                            f.createIdentifier("t"),
                            undefined,
                            undefined,
                            undefined
                        ),
                    ],
                    undefined,
                    f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    f.createBlock([...this.generateAllAssertStatements()], true)
                ),
            ])
        );
    }

    protected *generateAllAssertStatements(): Iterable<ts.Statement> {
        const { factory: f } = this;

        for (const nodeId in this.nodes) {
            yield* this.generateAssertStatementsForNode(nodeId);
        }
    }

    protected *generateAssertStatementsForNode(
        nodeId: string
    ): Iterable<ts.Statement> {
        const { factory: f } = this;
        const node = this.nodes[nodeId];

        const typeName = this.getTypeName(nodeId);

        for (const example of node.examples) {
            yield f.createExpressionStatement(
                f.createCallExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("assert"),
                        f.createIdentifier("equal")
                    ),
                    undefined,
                    [
                        f.createCallExpression(
                            f.createPropertyAccessExpression(
                                f.createIdentifier("validators"),
                                f.createIdentifier(`is${typeName}`)
                            ),
                            undefined,
                            [generateLiteral(f, example)]
                        ),
                        f.createTrue(),
                    ]
                )
            );
        }
    }

    protected getTypeName(nodeId: string) {
        const typeName = this.names[nodeId].join("_");
        return typeName;
    }
}
