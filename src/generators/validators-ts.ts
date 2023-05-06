import ts from "typescript";
import { ArrayTypeDescriptor, BooleanTypeDescriptor, InterfaceTypeDescriptor, IntersectionTypeDescriptor, NumberTypeDescriptor, RecordTypeDescriptor, StringTypeDescriptor, TupleTypeDescriptor, TypeDescriptorUnion, UnionTypeDescriptor } from "../schema/type-descriptors.js";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class ValidatorsTsCodeGenerator extends CodeGeneratorBase {

    public * getStatements() {
        const { factory: f } = this;

        yield f.createImportDeclaration(
            undefined,
            f.createImportClause(
                false,
                undefined,
                f.createNamespaceImport(f.createIdentifier("types")),
            ),
            f.createStringLiteral("./types.js"),
        );

        for (const [nodeId, typeName] of this.manager.getTypeNames()) {
            yield this.generateValidatorFunctionDeclarationStatement(
                nodeId,
                typeName,
            );
        }
    }

    protected generateValidatorFunctionDeclarationStatement(
        nodeId: string,
        typeName: string,
    ): ts.FunctionDeclaration {
        const { factory: f } = this;

        return f.createFunctionDeclaration(
            [
                f.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            undefined,
            `isValid${typeName}`,
            undefined,
            [
                f.createParameterDeclaration(
                    undefined,
                    undefined,
                    "value",
                    undefined,
                    f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
                ),
            ],
            f.createTypePredicateNode(
                undefined,
                f.createIdentifier("value"),
                this.generateTypeReference(nodeId),
            ),
            f.createBlock(
                [...this.generateValidatorFunctionBodyStatements(nodeId)],
                true,
            ),
        );
    }

    protected *generateValidatorFunctionBodyStatements(
        nodeId: string,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        for (const typeDescriptor of this.manager.selectNodeTypeDescriptors(nodeId)) {
            yield* this.generateTypeValidationStatements(nodeId, typeDescriptor);
        }

        yield f.createReturnStatement(
            f.createFalse(),
        );
    }

    protected generateTypeValidationStatements(
        nodeId: string,
        typeDescriptor: TypeDescriptorUnion,
    ) {
        switch (typeDescriptor.type) {
            case "never":
                return this.generateNeverTypeValidationStatements();

            case "any":
                return this.generateAnyTypeValidationStatements();

            case "null":
                return this.generateNullTypeValidationStatements();

            case "boolean":
                return this.generateBooleanTypeValidationStatements(
                    typeDescriptor,
                );

            case "number":
                return this.generateNumberTypeValidationStatements(
                    typeDescriptor,
                );

            case "string":
                return this.generateStringTypeValidationStatements(
                    typeDescriptor,
                );

            case "tuple":
                return this.generateTupleTypeValidationStatements(
                    typeDescriptor,
                );

            case "array":
                return this.generateArrayTypeValidationStatements(
                    typeDescriptor,
                );

            case "interface":
                return this.generateInterfaceTypeValidationStatements(
                    typeDescriptor,
                );

            case "record":
                return this.generateRecordTypeValidationStatements(
                    typeDescriptor,
                );

            case "union":
                return this.generateUnionTypeValidationStatements(
                    typeDescriptor,
                );

            case "intersection":
                return this.generateIntersectionTypeValidationStatements(
                    typeDescriptor,
                );

            default:
                throw new Error("type not supported");
        }
    }

    protected * generateNeverTypeValidationStatements(
    ): Iterable<ts.Statement> {
        const { factory: f } = this;
        /*
        never never validates
        */
        yield f.createReturnStatement(
            f.createFalse(),
        );
    }
    protected *generateAnyTypeValidationStatements(
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        /*
        any is always valid
        */
        yield f.createReturnStatement(
            f.createTrue(),
        );
    }
    protected *generateNullTypeValidationStatements(
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createIdentifier("value"),
                f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                f.createNull(),
            ),
            f.createBlock([
                f.createReturnStatement(
                    f.createTrue(),
                ),
            ], true),
        );
    }
    protected *generateBooleanTypeValidationStatements(
        typeDescriptor: BooleanTypeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createTypeOfExpression(f.createIdentifier("value")),
                f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                f.createStringLiteral("boolean"),
            ),
            f.createBlock([
                ...this.generateBooleanTypeInnerValidationStatements(
                    typeDescriptor,
                ),
            ], true),
        );
    }
    private *generateBooleanTypeInnerValidationStatements(
        typeDescriptor: BooleanTypeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        if (typeDescriptor.options != null) {
            yield f.createIfStatement(
                typeDescriptor.options
                    .map(option => f.createBinaryExpression(
                        f.createIdentifier("value"),
                        f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                        option ? f.createTrue() : f.createFalse(),
                    ),
                    )
                    .reduce((a, b) => f.createBinaryExpression(
                        a, f.createToken(ts.SyntaxKind.AmpersandAmpersandToken), b,
                    )),
                f.createBlock(
                    [f.createReturnStatement(f.createFalse())],
                    true,
                ),
                undefined,
            );
        }

        yield f.createReturnStatement(
            f.createTrue(),
        );
    }
    protected *generateNumberTypeValidationStatements(
        typeDescriptor: NumberTypeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createBinaryExpression(
                    f.createTypeOfExpression(f.createIdentifier("value")),
                    f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                    f.createStringLiteral("number"),
                ),
                f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                f.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    f.createCallExpression(
                        f.createIdentifier("isNaN"),
                        undefined,
                        [f.createIdentifier("value")],
                    ),
                ),
            ),
            f.createBlock([
                ...this.generateNumberTypeInnerValidationStatements(
                    typeDescriptor,
                ),
            ], true),
        );
    }
    private *generateNumberTypeInnerValidationStatements(
        typeDescriptor: NumberTypeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        switch (typeDescriptor.numberType) {
            case "integer": {
                yield f.createIfStatement(
                    f.createBinaryExpression(
                        f.createBinaryExpression(
                            f.createIdentifier("value"),
                            f.createToken(ts.SyntaxKind.PercentToken),
                            f.createNumericLiteral(1),
                        ),
                        f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                        f.createNumericLiteral(0),
                    ),
                    f.createBlock(
                        [f.createReturnStatement(f.createFalse())],
                        true,
                    ),
                    undefined,
                );
                break;
            }

            case "float": {
                break;
            }

            default:
                throw new TypeError(
                    `unexpected numberType (${typeDescriptor.numberType})`,
                );

        }

        if (typeDescriptor.minimumInclusive != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createIdentifier("value"),
                    f.createToken(ts.SyntaxKind.LessThanToken),
                    f.createNumericLiteral(typeDescriptor.minimumInclusive),
                ),
                f.createBlock(
                    [f.createReturnStatement(f.createFalse())],
                    true,
                ),
                undefined,
            );
        }

        if (typeDescriptor.minimumExclusive != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createIdentifier("value"),
                    f.createToken(ts.SyntaxKind.LessThanEqualsToken),
                    f.createNumericLiteral(typeDescriptor.minimumExclusive),
                ),
                f.createBlock(
                    [f.createReturnStatement(f.createFalse())],
                    true,
                ),
                undefined,
            );
        }

        if (typeDescriptor.maximumInclusive != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createIdentifier("value"),
                    f.createToken(ts.SyntaxKind.GreaterThanToken),
                    f.createNumericLiteral(typeDescriptor.maximumInclusive),
                ),
                f.createBlock(
                    [f.createReturnStatement(f.createFalse())],
                    true,
                ),
                undefined,
            );
        }

        if (typeDescriptor.maximumExclusive != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createIdentifier("value"),
                    f.createToken(ts.SyntaxKind.GreaterThanEqualsToken),
                    f.createNumericLiteral(typeDescriptor.maximumExclusive),
                ),
                f.createBlock(
                    [f.createReturnStatement(f.createFalse())],
                    true,
                ),
                undefined,
            );
        }

        if (typeDescriptor.multipleOf != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createBinaryExpression(
                        f.createIdentifier("value"),
                        f.createToken(ts.SyntaxKind.PercentToken),
                        f.createNumericLiteral(typeDescriptor.multipleOf),
                    ),
                    f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                    f.createNumericLiteral(0),
                ),
                f.createBlock(
                    [f.createReturnStatement(f.createFalse())],
                    true,
                ),
                undefined,
            );
        }

        if (typeDescriptor.options != null) {
            yield f.createIfStatement(
                typeDescriptor.options.map(option => f.createBinaryExpression(
                    f.createIdentifier("value"),
                    f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                    f.createNumericLiteral(option),
                ),
                ).reduce((a, b) => f.createBinaryExpression(
                    a,
                    f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                    b),
                ),
                f.createBlock(
                    [f.createReturnStatement(f.createFalse())],
                    true,
                ),
                undefined,
            );
        }

        yield f.createReturnStatement(
            f.createTrue(),
        );
    }
    protected *generateStringTypeValidationStatements(
        typeDescriptor: StringTypeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createTypeOfExpression(f.createIdentifier("value")),
                f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                f.createStringLiteral("string"),
            ),
            f.createBlock([
                ...this.generateStringTypeInnerValidationStatements(
                    typeDescriptor,
                ),
            ], true),
        );
    }
    private *generateStringTypeInnerValidationStatements(
        typeDescriptor: StringTypeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        if (typeDescriptor.minimumLength != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("value"),
                        f.createIdentifier("length"),
                    ),
                    f.createToken(ts.SyntaxKind.LessThanToken),
                    f.createNumericLiteral(typeDescriptor.minimumLength),
                ),
                f.createBlock(
                    [f.createReturnStatement(f.createFalse())],
                    true,
                ),
                undefined,
            );
        }

        if (typeDescriptor.maximumLength != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("value"),
                        f.createIdentifier("length"),
                    ),
                    f.createToken(ts.SyntaxKind.LessThanToken),
                    f.createNumericLiteral(typeDescriptor.maximumLength),
                ),
                f.createBlock(
                    [f.createReturnStatement(f.createFalse())],
                    true,
                ),
                undefined,
            );
        }

        if (typeDescriptor.valuePattern != null) {
            yield f.createIfStatement(
                f.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    f.createCallExpression(
                        f.createPropertyAccessExpression(
                            f.createRegularExpressionLiteral(`/${typeDescriptor.valuePattern}/`),
                            f.createIdentifier("test"),
                        ),
                        undefined,
                        [f.createIdentifier("value")],
                    ),
                ),
                f.createBlock(
                    [f.createReturnStatement(f.createFalse())],
                    true,
                ),
                undefined,
            );
        }

        if (typeDescriptor.options != null) {
            yield f.createIfStatement(
                typeDescriptor.options.map(option => f.createBinaryExpression(
                    f.createIdentifier("value"),
                    f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                    f.createStringLiteral(option),
                ),
                ).reduce((a, b) => f.createBinaryExpression(
                    a,
                    f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                    b),
                ),
                f.createBlock(
                    [f.createReturnStatement(f.createFalse())],
                    true,
                ),
                undefined,
            );
        }

        yield f.createReturnStatement(
            f.createTrue(),
        );
    }
    protected *generateTupleTypeValidationStatements(
        typeDescriptor: TupleTypeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createBinaryExpression(
                    f.createTypeOfExpression(f.createIdentifier("value")),
                    f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                    f.createStringLiteral("object"),
                ),
                f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                f.createCallExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("Array"),
                        f.createIdentifier("isArray"),
                    ),
                    undefined,
                    [f.createIdentifier("value")],
                ),
            ),
            f.createBlock([
                ...this.generateTupleTypeInnerValidationStatements(
                    typeDescriptor,
                ),
            ], true),
        );
    }
    private *generateTupleTypeInnerValidationStatements(
        typeDescriptor: TupleTypeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createPropertyAccessExpression(
                    f.createIdentifier("value"),
                    f.createIdentifier("length"),
                ),
                f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                f.createNumericLiteral(typeDescriptor.itemTypeNodeIds.length),
            ),
            f.createBlock([
                f.createReturnStatement(f.createFalse()),
            ], true),
        );

        yield f.createForInStatement(
            f.createVariableDeclarationList([
                f.createVariableDeclaration(
                    f.createIdentifier("elementIndex"),
                ),
            ], ts.NodeFlags.Const),
            f.createIdentifier("value"),
            f.createBlock([
                f.createVariableStatement(
                    undefined,
                    f.createVariableDeclarationList([
                        f.createVariableDeclaration(
                            f.createIdentifier("elementValue"),
                            undefined,
                            undefined,
                            f.createElementAccessExpression(
                                f.createIdentifier("value"),
                                f.createIdentifier("elementIndex"),
                            ),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                f.createSwitchStatement(
                    f.createIdentifier("elementIndex"),
                    f.createCaseBlock([
                        ...this.generateTupleTypeCaseClausesValidationStatements(
                            typeDescriptor,
                        ),
                    ]),
                ),
            ], true),
        );

        yield f.createReturnStatement(
            f.createTrue(),
        );
    }
    private *generateTupleTypeCaseClausesValidationStatements(
        typeDescriptor: TupleTypeDescriptor,
    ): Iterable<ts.CaseOrDefaultClause> {
        const { factory: f } = this;

        for (const elementIndex in typeDescriptor.itemTypeNodeIds) {
            const itemTypeNodeId = typeDescriptor.itemTypeNodeIds[elementIndex];
            const typeName = this.getTypeName(itemTypeNodeId);

            yield f.createCaseClause(
                f.createNumericLiteral(elementIndex),
                [
                    f.createIfStatement(
                        f.createPrefixUnaryExpression(
                            ts.SyntaxKind.ExclamationToken,
                            f.createCallExpression(
                                f.createIdentifier(`isValid${typeName}`),
                                undefined,
                                [
                                    f.createIdentifier("elementValue"),
                                ],
                            ),
                        ),
                        f.createBlock([
                            f.createReturnStatement(f.createFalse()),
                        ], true),
                    ),
                    f.createBreakStatement(),
                ],
            );
        }

        yield f.createDefaultClause([
            f.createReturnStatement(
                f.createFalse(),
            ),
        ]);

    }

    protected *generateArrayTypeValidationStatements(
        typeDescriptor: ArrayTypeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createBinaryExpression(
                    f.createTypeOfExpression(f.createIdentifier("value")),
                    f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                    f.createStringLiteral("object"),
                ),
                f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                f.createCallExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("Array"),
                        f.createIdentifier("isArray"),
                    ),
                    undefined,
                    [f.createIdentifier("value")],
                ),
            ),
            f.createBlock([
                ...this.generateArrayTypeInnerValidationStatements(
                    typeDescriptor,
                ),
            ], true),
        );
    }
    private *generateArrayTypeInnerValidationStatements(
        typeDescriptor: ArrayTypeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;
        const typeName = this.getTypeName(typeDescriptor.itemTypeNodeId);

        yield f.createForInStatement(
            f.createVariableDeclarationList([
                f.createVariableDeclaration(
                    f.createIdentifier("elementIndex"),
                ),
            ], ts.NodeFlags.Const),
            f.createIdentifier("value"),
            f.createBlock([
                f.createVariableStatement(
                    undefined,
                    f.createVariableDeclarationList([
                        f.createVariableDeclaration(
                            f.createIdentifier("elementValue"),
                            undefined,
                            undefined,
                            f.createElementAccessExpression(
                                f.createIdentifier("value"),
                                f.createIdentifier("elementIndex"),
                            ),
                        ),
                    ], ts.NodeFlags.Const),
                ), f.createIfStatement(
                    f.createPrefixUnaryExpression(
                        ts.SyntaxKind.ExclamationToken,
                        f.createCallExpression(
                            f.createIdentifier(`isValid${typeName}`),
                            undefined,
                            [
                                f.createIdentifier("elementValue"),
                            ],
                        ),
                    ),
                    f.createBlock([
                        f.createReturnStatement(f.createFalse()),
                    ], true),
                ),
            ], true),
        );

        yield f.createReturnStatement(
            f.createTrue(),
        );
    }
    protected *generateInterfaceTypeValidationStatements(
        typeDescriptor: InterfaceTypeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createBinaryExpression(
                    f.createBinaryExpression(
                        f.createTypeOfExpression(f.createIdentifier("value")),
                        f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                        f.createStringLiteral("object"),
                    ),
                    f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                    f.createBinaryExpression(
                        f.createIdentifier("value"),
                        f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                        f.createNull(),
                    ),
                ),
                f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                f.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    f.createCallExpression(
                        f.createPropertyAccessExpression(
                            f.createIdentifier("Array"),
                            f.createIdentifier("isArray"),
                        ),
                        undefined,
                        [f.createIdentifier("value")],
                    ),
                ),
            ),
            f.createBlock([
                ...this.generateInterfaceTypeInnerValidationStatements(
                    typeDescriptor,
                ),
            ], true),
        );
    }
    private *generateInterfaceTypeInnerValidationStatements(
        typeDescriptor: InterfaceTypeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createForInStatement(
            f.createVariableDeclarationList([
                f.createVariableDeclaration(
                    f.createIdentifier("propertyName"),
                ),
            ], ts.NodeFlags.Const),
            f.createIdentifier("value"),
            f.createBlock([
                f.createVariableStatement(
                    undefined,
                    f.createVariableDeclarationList([
                        f.createVariableDeclaration(
                            f.createIdentifier("propertyValue"),
                            undefined,
                            undefined,
                            f.createElementAccessExpression(
                                f.createIdentifier("value"),
                                f.createAsExpression(
                                    f.createIdentifier("propertyName"),
                                    f.createTypeOperatorNode(
                                        ts.SyntaxKind.KeyOfKeyword,
                                        f.createTypeQueryNode(
                                            f.createIdentifier("value"),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                f.createSwitchStatement(
                    f.createIdentifier("propertyName"),
                    f.createCaseBlock([
                        ...this.generateInterfaceTypeCaseClausesValidationStatements(
                            typeDescriptor,
                        ),
                    ]),
                ),
            ], true),
        );

        yield f.createReturnStatement(
            f.createTrue(),
        );
    }
    private * generateInterfaceTypeCaseClausesValidationStatements(
        typeDescriptor: InterfaceTypeDescriptor,
    ): Iterable<ts.CaseOrDefaultClause> {
        const { factory: f } = this;

        for (const propertyName in typeDescriptor.propertyTypeNodeIds) {
            const propertyTypeNodeId = typeDescriptor.propertyTypeNodeIds[propertyName];
            const typeName = this.getTypeName(propertyTypeNodeId);

            yield f.createCaseClause(
                f.createStringLiteral(propertyName),
                [
                    f.createIfStatement(
                        f.createPrefixUnaryExpression(
                            ts.SyntaxKind.ExclamationToken,
                            f.createCallExpression(
                                f.createIdentifier(`isValid${typeName}`),
                                undefined,
                                [
                                    f.createIdentifier("propertyValue"),
                                ],
                            ),
                        ),
                        f.createBlock([
                            f.createReturnStatement(f.createFalse()),
                        ], true),
                    ),
                    f.createBreakStatement(),
                ],
            );
        }

        yield f.createDefaultClause([
            f.createReturnStatement(
                f.createFalse(),
            ),
        ]);
    }

    protected *generateRecordTypeValidationStatements(
        typeDescriptor: RecordTypeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createBinaryExpression(
                    f.createBinaryExpression(
                        f.createTypeOfExpression(f.createIdentifier("value")),
                        f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                        f.createStringLiteral("object"),
                    ),
                    f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                    f.createBinaryExpression(
                        f.createIdentifier("value"),
                        f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                        f.createNull(),
                    ),
                ),
                f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                f.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    f.createCallExpression(
                        f.createPropertyAccessExpression(
                            f.createIdentifier("Array"),
                            f.createIdentifier("isArray"),
                        ),
                        undefined,
                        [f.createIdentifier("value")],
                    ),
                ),
            ),
            f.createBlock([
                ...this.generateRecordTypeInnerValidationStatements(
                    typeDescriptor,
                ),
            ], true),
        );
    }
    private *generateRecordTypeInnerValidationStatements(
        typeDescriptor: RecordTypeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;
        const typeName = this.getTypeName(typeDescriptor.propertyTypeNodeId);

        yield f.createForInStatement(
            f.createVariableDeclarationList([
                f.createVariableDeclaration(
                    f.createIdentifier("propertyName"),
                ),
            ], ts.NodeFlags.Const),
            f.createIdentifier("value"),
            f.createBlock([
                f.createVariableStatement(
                    undefined,
                    f.createVariableDeclarationList([
                        f.createVariableDeclaration(
                            f.createIdentifier("propertyValue"),
                            undefined,
                            undefined,
                            f.createElementAccessExpression(
                                f.createIdentifier("value"),
                                f.createAsExpression(
                                    f.createIdentifier("propertyName"),
                                    f.createTypeOperatorNode(
                                        ts.SyntaxKind.KeyOfKeyword,
                                        f.createTypeQueryNode(
                                            f.createIdentifier("value"),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    ], ts.NodeFlags.Const),
                ),
                f.createIfStatement(
                    f.createPrefixUnaryExpression(
                        ts.SyntaxKind.ExclamationToken,
                        f.createCallExpression(
                            f.createIdentifier(`isValid${typeName}`),
                            undefined,
                            [
                                f.createIdentifier("propertyValue"),
                            ],
                        ),
                    ),
                    f.createBlock([
                        f.createReturnStatement(f.createFalse()),
                    ], true),
                ),
            ], true),
        );

        yield f.createReturnStatement(
            f.createTrue(),
        );
    }
    protected *generateUnionTypeValidationStatements(
        typeDescriptor: UnionTypeDescriptor,
    ): Iterable<ts.Statement> {
        yield* [];
    }
    protected *generateIntersectionTypeValidationStatements(
        typeDescriptor: IntersectionTypeDescriptor,
    ): Iterable<ts.Statement> {
        yield* [];
    }

    protected getTypeName(
        nodeId: string,
    ) {
        const typeName = this.namer.getName(nodeId).join("_");
        return typeName;
    }

    protected generateTypeReference(
        nodeId: string,
    ) {
        const { factory: f } = this;

        const typeName = this.getTypeName(nodeId);
        return f.createTypeReferenceNode(
            f.createQualifiedName(
                f.createIdentifier("types"),
                f.createIdentifier(typeName),
            ),
        );
    }

}
