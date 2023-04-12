import ts from "typescript";
import { Namer, generateLiteral } from "../utils/index.js";
import { SchemaCodeGeneratorBase } from "./code-generator.js";

export abstract class SchemaValidatorCodeGeneratorBase extends SchemaCodeGeneratorBase {

    protected abstract generateValidatorFunctionBodyStatements(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
    ): Iterable<ts.Statement>

    protected generateNullTypeValidationStatements(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
    ): Iterable<ts.Statement> {
        return [];
    }
    protected abstract generateArrayTypeValidationStatements(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string
    ): Iterable<ts.Statement>
    protected abstract generateObjectTypeValidationStatements(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string
    ): Iterable<ts.Statement>
    protected abstract generateStringTypeValidationStatements(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string
    ): Iterable<ts.Statement>
    protected abstract generateNumberTypeValidationStatements(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string
    ): Iterable<ts.Statement>
    protected generateIntegerTypeValidationStatements(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
    ): Iterable<ts.Statement> {
        return this.generateNumberTypeValidationStatements(
            factory,
            namer,
            nodeId,
        );
    }
    protected generateBooleanTypeValidationStatements(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
    ): Iterable<ts.Statement> {
        return [];
    }

    public *generateStatements(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
    ) {
        const typeName = namer.getName(nodeId).join("_");

        yield this.generateValidatorFunctionDeclarationStatement(
            factory,
            namer,
            nodeId,
            typeName,
        );
    }

    protected generateValidatorFunctionDeclarationStatement(
        factory: ts.NodeFactory,
        namer: Namer,
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
                    this.generateTypeReference(factory, namer, nodeId),
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
            factory.createTypeReferenceNode(
                factory.createIdentifier("Iterable"),
                [
                    factory.createTypeReferenceNode(factory.createQualifiedName(
                        factory.createIdentifier("validation"),
                        factory.createIdentifier("PathError"),
                    ),
                    ),
                ],
            ),
            factory.createBlock(
                [...this.generateValidatorFunctionBodyStatements(factory, namer, nodeId)],
                true,
            ),
        );
    }

    protected generateTypeValidationIfStatement(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
        type: string,
        elseStatement: ts.Statement,
    ) {
        const thenBlock = factory.createBlock(
            [...this.generateTypeValidationStatements(factory, namer, nodeId, type)],
            true,
        );

        const testExpression = this.generateCallValidateTypeExpression(
            factory,
            type,
        );

        return factory.createIfStatement(
            testExpression,
            thenBlock,
            elseStatement,
        );
    }

    protected *generateTypeValidationStatements(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
        type: string,
    ) {
        switch (type) {
            case "null":
                yield* this.generateNullTypeValidationStatements(factory, namer, nodeId);
                break;

            case "array":
                yield* this.generateArrayTypeValidationStatements(factory, namer, nodeId);
                break;

            case "object":
                yield* this.generateObjectTypeValidationStatements(factory, namer, nodeId);
                break;

            case "string":
                yield* this.generateStringTypeValidationStatements(factory, namer, nodeId);
                break;

            case "number":
                yield* this.generateNumberTypeValidationStatements(factory, namer, nodeId);
                break;

            case "integer":
                yield* this.generateIntegerTypeValidationStatements(factory, namer, nodeId);
                break;

            case "boolean":
                yield* this.generateBooleanTypeValidationStatements(factory, namer, nodeId);
                break;

            default:
                throw new Error("type not supported");
        }
    }

    protected wrapValidationExpression(
        factory: ts.NodeFactory,
        testExpression: ts.Expression,
        error: string,
    ) {
        return factory.createIfStatement(
            factory.createPrefixUnaryExpression(
                ts.SyntaxKind.ExclamationToken,
                testExpression,
            ),
            factory.createBlock([
                factory.createExpressionStatement(factory.createYieldExpression(
                    undefined,
                    factory.createObjectLiteralExpression([
                        factory.createShorthandPropertyAssignment(factory.createIdentifier("path")),
                        factory.createPropertyAssignment(
                            "error",
                            factory.createStringLiteral(error),
                        ),
                    ]),
                )),
            ]),
        );
    }

    protected generateCallValidatorExpression(
        factory: ts.NodeFactory,
        validatorName: string,
        validateArgument: unknown,
    ) {

        return factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createIdentifier("validation"),
                validatorName,
            ),
            undefined,
            [
                factory.createIdentifier("value"),
                generateLiteral(factory, validateArgument),
            ],
        );
    }

    protected generateCallValidateTypeExpression(
        factory: ts.NodeFactory,
        type: unknown,
    ) {

        switch (type) {
            case "null":
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("validation"),
                        factory.createIdentifier("isValidNullType"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                    ],
                );

            case "array":
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("validation"),
                        factory.createIdentifier("isValidArrayType"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                    ],
                );

            case "object":
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("validation"),
                        factory.createIdentifier("isValidObjectType"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                    ],
                );

            case "string":
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("validation"),
                        factory.createIdentifier("isValidStringType"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                    ],
                );

            case "number":
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("validation"),
                        factory.createIdentifier("isValidNumberType"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                    ],
                );

            case "integer":
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("validation"),
                        factory.createIdentifier("isValidIntegerType"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                    ],
                );

            case "boolean":
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("validation"),
                        factory.createIdentifier("isValidBooleanType"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                    ],
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
            factory.createQualifiedName(
                factory.createIdentifier("types"),
                factory.createIdentifier(typeName),
            ),
        );
    }

}

