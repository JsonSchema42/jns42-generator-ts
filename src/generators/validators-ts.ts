import ts from "typescript";
import { generateLiteral } from "../utils/index.js";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class ValidatorsTsCodeGenerator extends CodeGeneratorBase {

    public * getStatements() {
        for (const [nodeId, typeName] of this.manager.getTypeNames()) {
            yield* this.generateNodeStatements(nodeId);
        }
    }

    protected *generateNodeStatements(
        nodeId: string,
    ) {
        const typeName = this.namer.getName(nodeId).join("_");

        yield this.generateValidatorFunctionDeclarationStatement(
            nodeId,
            typeName,
        );
    }

    protected generateValidatorFunctionBodyStatements(
        nodeId: string,
    ): Iterable<ts.Statement> {
        throw new Error("todo");
    }

    protected generateNullTypeValidationStatements(
        nodeId: string,
    ): Iterable<ts.Statement> {
        return [];
    }
    protected generateArrayTypeValidationStatements(
        nodeId: string,
    ): Iterable<ts.Statement> {
        throw new Error("todo");
    }
    protected generateObjectTypeValidationStatements(
        nodeId: string,
    ): Iterable<ts.Statement> {
        throw new Error("todo");
    }
    protected generateStringTypeValidationStatements(
        nodeId: string,
    ): Iterable<ts.Statement> {
        throw new Error("todo");
    }
    protected generateNumberTypeValidationStatements(
        nodeId: string,
    ): Iterable<ts.Statement> {
        throw new Error("todo");
    }
    protected generateIntegerTypeValidationStatements(
        nodeId: string,
    ): Iterable<ts.Statement> {
        return this.generateNumberTypeValidationStatements(
            nodeId,
        );
    }
    protected generateBooleanTypeValidationStatements(
        nodeId: string,
    ): Iterable<ts.Statement> {
        return [];
    }

    protected generateValidatorFunctionDeclarationStatement(
        nodeId: string,
        typeName: string,
    ): ts.FunctionDeclaration {
        return this.factory.createFunctionDeclaration(
            [
                this.factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            this.factory.createToken(ts.SyntaxKind.AsteriskToken),
            `validate${typeName}`,
            undefined,
            [
                this.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    "value",
                    undefined,
                    this.generateTypeReference(nodeId),
                ),
                this.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    "path",
                    undefined,
                    this.factory.createArrayTypeNode(
                        this.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    ),
                    this.factory.createArrayLiteralExpression([]),
                ),
            ],
            this.factory.createTypeReferenceNode(
                this.factory.createIdentifier("Iterable"),
                [
                    this.factory.createTypeReferenceNode(this.factory.createQualifiedName(
                        this.factory.createIdentifier("validation"),
                        this.factory.createIdentifier("PathError"),
                    ),
                    ),
                ],
            ),
            this.factory.createBlock(
                [...this.generateValidatorFunctionBodyStatements(nodeId)],
                true,
            ),
        );
    }

    protected generateTypeValidationIfStatement(
        nodeId: string,
        type: string,
        elseStatement: ts.Statement,
    ) {
        const thenBlock = this.factory.createBlock(
            [...this.generateTypeValidationStatements(nodeId, type)],
            true,
        );

        const testExpression = this.generateCallValidateTypeExpression(
            type,
        );

        return this.factory.createIfStatement(
            testExpression,
            thenBlock,
            elseStatement,
        );
    }

    protected *generateTypeValidationStatements(
        nodeId: string,
        type: string,
    ) {
        switch (type) {
            case "null":
                yield* this.generateNullTypeValidationStatements(nodeId);
                break;

            case "array":
                yield* this.generateArrayTypeValidationStatements(nodeId);
                break;

            case "object":
                yield* this.generateObjectTypeValidationStatements(nodeId);
                break;

            case "string":
                yield* this.generateStringTypeValidationStatements(nodeId);
                break;

            case "number":
                yield* this.generateNumberTypeValidationStatements(nodeId);
                break;

            case "integer":
                yield* this.generateIntegerTypeValidationStatements(nodeId);
                break;

            case "boolean":
                yield* this.generateBooleanTypeValidationStatements(nodeId);
                break;

            default:
                throw new Error("type not supported");
        }
    }

    protected wrapValidationExpression(
        testExpression: ts.Expression,
        error: string,
    ) {
        return this.factory.createIfStatement(
            this.factory.createPrefixUnaryExpression(
                ts.SyntaxKind.ExclamationToken,
                testExpression,
            ),
            this.factory.createBlock([
                this.factory.createExpressionStatement(this.factory.createYieldExpression(
                    undefined,
                    this.factory.createObjectLiteralExpression([
                        this.factory.createShorthandPropertyAssignment(this.factory.createIdentifier("path")),
                        this.factory.createPropertyAssignment(
                            "error",
                            this.factory.createStringLiteral(error),
                        ),
                    ]),
                )),
            ]),
        );
    }

    protected generateCallValidatorExpression(
        validatorName: string,
        validateArgument: unknown,
    ) {

        return this.factory.createCallExpression(
            this.factory.createPropertyAccessExpression(
                this.factory.createIdentifier("validation"),
                validatorName,
            ),
            undefined,
            [
                this.factory.createIdentifier("value"),
                generateLiteral(this.factory, validateArgument),
            ],
        );
    }

    protected generateCallValidateTypeExpression(
        type: unknown,
    ) {

        switch (type) {
            case "null":
                return this.factory.createCallExpression(
                    this.factory.createPropertyAccessExpression(
                        this.factory.createIdentifier("validation"),
                        this.factory.createIdentifier("isValidNullType"),
                    ),
                    undefined,
                    [
                        this.factory.createIdentifier("value"),
                    ],
                );

            case "array":
                return this.factory.createCallExpression(
                    this.factory.createPropertyAccessExpression(
                        this.factory.createIdentifier("validation"),
                        this.factory.createIdentifier("isValidArrayType"),
                    ),
                    undefined,
                    [
                        this.factory.createIdentifier("value"),
                    ],
                );

            case "object":
                return this.factory.createCallExpression(
                    this.factory.createPropertyAccessExpression(
                        this.factory.createIdentifier("validation"),
                        this.factory.createIdentifier("isValidObjectType"),
                    ),
                    undefined,
                    [
                        this.factory.createIdentifier("value"),
                    ],
                );

            case "string":
                return this.factory.createCallExpression(
                    this.factory.createPropertyAccessExpression(
                        this.factory.createIdentifier("validation"),
                        this.factory.createIdentifier("isValidStringType"),
                    ),
                    undefined,
                    [
                        this.factory.createIdentifier("value"),
                    ],
                );

            case "number":
                return this.factory.createCallExpression(
                    this.factory.createPropertyAccessExpression(
                        this.factory.createIdentifier("validation"),
                        this.factory.createIdentifier("isValidNumberType"),
                    ),
                    undefined,
                    [
                        this.factory.createIdentifier("value"),
                    ],
                );

            case "integer":
                return this.factory.createCallExpression(
                    this.factory.createPropertyAccessExpression(
                        this.factory.createIdentifier("validation"),
                        this.factory.createIdentifier("isValidIntegerType"),
                    ),
                    undefined,
                    [
                        this.factory.createIdentifier("value"),
                    ],
                );

            case "boolean":
                return this.factory.createCallExpression(
                    this.factory.createPropertyAccessExpression(
                        this.factory.createIdentifier("validation"),
                        this.factory.createIdentifier("isValidBooleanType"),
                    ),
                    undefined,
                    [
                        this.factory.createIdentifier("value"),
                    ],
                );

            default:
                throw new Error("type not supported");
        }
    }

    protected generateTypeReference(
        nodeId: string,
    ) {
        const typeName = this.namer.getName(nodeId).join("_");
        return this.factory.createTypeReferenceNode(
            this.factory.createQualifiedName(
                this.factory.createIdentifier("types"),
                this.factory.createIdentifier(typeName),
            ),
        );
    }

}
