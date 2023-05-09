import ts from "typescript";
import { NodeDescriptor } from "../schema/descriptors.js";
import { generateLiteral } from "../utils/literal.js";
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

        yield f.createImportDeclaration(
            undefined,
            f.createImportClause(
                false,
                undefined,
                f.createNamespaceImport(f.createIdentifier("validators")),
            ),
            f.createStringLiteral("./validators.js"),
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
                        ...this.generateAllAssertStatements(),
                    ], true),
                ),
            ],
        ));

    }

    protected *generateAllAssertStatements(): Iterable<ts.Statement> {
        const { factory: f } = this;

        for (const nodeDescriptor of this.context.selectNodeDescriptors()) {
            yield* this.generateAssertStatementsForNode(
                nodeDescriptor,
            );
        }
    }

    protected *generateAssertStatementsForNode(
        nodeDescriptor: NodeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        const typeName = this.getTypeName(nodeDescriptor.nodeId);

        for (const example of nodeDescriptor.examples) {
            yield f.createExpressionStatement(f.createCallExpression(
                f.createPropertyAccessExpression(
                    f.createIdentifier("assert"),
                    f.createIdentifier("equal"),
                ),
                undefined,
                [
                    f.createCallExpression(
                        f.createPropertyAccessExpression(
                            f.createIdentifier("validators"),
                            f.createIdentifier(`is${typeName}`),
                        ),
                        undefined,
                        [
                            generateLiteral(f, example),
                        ],
                    ),
                    f.createTrue(),
                ],
            ));
        }
    }

    protected getTypeName(
        nodeId: string,
    ) {
        const typeName = this.namer.getName(nodeId).join("_");
        return typeName;
    }
}
