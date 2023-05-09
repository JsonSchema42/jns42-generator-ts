import camelcase from "camelcase";
import ts from "typescript";
import { ArrayTypeDescriptor, BooleanTypeDescriptor, CompoundDescriptorUnion, InterfaceTypeDescriptor, NodeDescriptor, NumberTypeDescriptor, RecordTypeDescriptor, StringTypeDescriptor, TupleTypeDescriptor, TypeDescriptorUnion } from "../schema/descriptors.js";
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

        for (const nodeDescriptor of this.context.selectNodeDescriptors()) {
            yield* this.generateValidatorFunctionDeclarationStatements(
                nodeDescriptor,
            );
        }
    }

    protected * generateValidatorFunctionDeclarationStatements(
        nodeDescriptor: NodeDescriptor,
    ): Iterable<ts.FunctionDeclaration> {
        const { factory: f } = this;

        const typeName = this.getTypeName(nodeDescriptor.nodeId);

        yield f.createFunctionDeclaration(
            [
                f.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            undefined,
            `is${typeName}`,
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
                this.generateTypeReference(nodeDescriptor.nodeId),
            ),
            f.createBlock([
                ...this.generateValidatorFunctionBodyStatements(nodeDescriptor),
            ], true),
        );

        for (
            const typeDescriptor of
            this.context.selectNodeTypeDescriptors(nodeDescriptor.nodeId)
        ) {
            yield f.createFunctionDeclaration(
                undefined,
                undefined,
                `is${camelcase(typeDescriptor.type, { pascalCase: true })}${typeName}`,
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
                    f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
                ),
                f.createBlock([
                    ...this.generateTypeValidationStatements(nodeDescriptor.nodeId, typeDescriptor),
                ], true),
            );
        }

        for (
            const compoundDescriptor of
            this.context.selectNodeCompoundDescriptors(nodeDescriptor.nodeId)
        ) {
            yield f.createFunctionDeclaration(
                undefined,
                undefined,
                `is${camelcase(compoundDescriptor.type, { pascalCase: true })}${typeName}`,
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
                    f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
                ),
                f.createBlock([
                    ...this.generateCompoundValidationStatements(
                        nodeDescriptor.nodeId,
                        compoundDescriptor,
                    ),
                ], true),
            );
        }

    }

    protected *generateValidatorFunctionBodyStatements(
        nodeDescriptor: NodeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        const typeName = this.getTypeName(nodeDescriptor.nodeId);
        const typeDescriptors = [
            ...this.context.selectNodeTypeDescriptors(nodeDescriptor.nodeId),
        ];
        const compoundDescriptors = [
            ...this.context.selectNodeCompoundDescriptors(nodeDescriptor.nodeId),
        ];

        if (nodeDescriptor.superNodeId != null) {
            const referencingTypeName = this.getTypeName(nodeDescriptor.superNodeId);

            yield f.createIfStatement(
                f.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    f.createCallExpression(
                        f.createIdentifier(`is${referencingTypeName}`),
                        undefined,
                        [f.createIdentifier("value")],
                    ),
                ),
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
            );
        }

        if (typeDescriptors.length > 0) {
            yield f.createIfStatement(
                f.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    f.createParenthesizedExpression(
                        typeDescriptors.
                            map(typeDescriptor => f.createCallExpression(
                                f.createIdentifier(`is${camelcase(typeDescriptor.type, { pascalCase: true })}${typeName}`),
                                undefined,
                                [f.createIdentifier("value")],
                            ) as ts.Expression).
                            reduce((a, b) => f.createBinaryExpression(
                                a, f.createToken(ts.SyntaxKind.BarBarToken), b,
                            )),
                    )
                    ,
                ),
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
            );
        }

        if (compoundDescriptors.length > 0) {
            yield f.createIfStatement(
                f.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    f.createParenthesizedExpression(
                        compoundDescriptors.
                            map(compoundDescriptor => f.createCallExpression(
                                f.createIdentifier(`is${camelcase(compoundDescriptor.type, { pascalCase: true })}${typeName}`),
                                undefined,
                                [f.createIdentifier("value")],
                            ) as ts.Expression).
                            reduce((a, b) => f.createBinaryExpression(
                                a, f.createToken(ts.SyntaxKind.AmpersandAmpersandToken), b,
                            )),
                    )
                    ,
                ),
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
            );
        }

        yield f.createReturnStatement(
            f.createTrue(),
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

            default:
                throw new Error("type not supported");
        }
    }

    protected generateCompoundValidationStatements(
        nodeId: string,
        compoundDescriptor: CompoundDescriptorUnion,
    ) {
        switch (compoundDescriptor.type) {
            case "one-of":
                return this.generateOneOfCompoundValidationStatements(
                    compoundDescriptor.typeNodeIds,
                );

            case "any-of":
                return this.generateAnyOfCompoundValidationStatements(
                    compoundDescriptor.typeNodeIds,
                );

            case "all-of":
                return this.generateAllOfCompoundValidationStatements(
                    compoundDescriptor.typeNodeIds,
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
                f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                f.createStringLiteral("boolean"),
            ),
            f.createBlock([
                f.createReturnStatement(
                    f.createFalse(),
                ),
            ], true),
        );

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
                    f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                    f.createStringLiteral("number"),
                ),
                f.createToken(ts.SyntaxKind.BarBarToken),
                f.createCallExpression(
                    f.createIdentifier("isNaN"),
                    undefined,
                    [f.createIdentifier("value")],
                ),
            ),
            f.createBlock([
                f.createReturnStatement(
                    f.createFalse(),
                ),
            ], true),
        );

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
                    f.createBlock([
                        f.createReturnStatement(f.createFalse()),
                    ], true),
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
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
            );
        }

        if (typeDescriptor.minimumExclusive != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createIdentifier("value"),
                    f.createToken(ts.SyntaxKind.LessThanEqualsToken),
                    f.createNumericLiteral(typeDescriptor.minimumExclusive),
                ),
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
            );
        }

        if (typeDescriptor.maximumInclusive != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createIdentifier("value"),
                    f.createToken(ts.SyntaxKind.GreaterThanToken),
                    f.createNumericLiteral(typeDescriptor.maximumInclusive),
                ),
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
            );
        }

        if (typeDescriptor.maximumExclusive != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createIdentifier("value"),
                    f.createToken(ts.SyntaxKind.GreaterThanEqualsToken),
                    f.createNumericLiteral(typeDescriptor.maximumExclusive),
                ),
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
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
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
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
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
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
                f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                f.createStringLiteral("string"),
            ),
            f.createBlock([
                f.createReturnStatement(f.createFalse()),
            ], true),
        );

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
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
            );
        }

        if (typeDescriptor.maximumLength != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("value"),
                        f.createIdentifier("length"),
                    ),
                    f.createToken(ts.SyntaxKind.GreaterThanToken),
                    f.createNumericLiteral(typeDescriptor.maximumLength),
                ),
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
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
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
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
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
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
            f.createBlock([
                f.createReturnStatement(f.createFalse()),
            ], true),
        );

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
                                f.createIdentifier(`is${typeName}`),
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
        const typeName = this.getTypeName(typeDescriptor.itemTypeNodeId);
        const hasSeenSet = typeDescriptor.uniqueItems ?? false;

        yield f.createIfStatement(
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
            f.createBlock([
                f.createReturnStatement(f.createFalse()),
            ], true),
        );

        if (typeDescriptor.minimumItems != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("value"),
                        f.createIdentifier("length"),
                    ),
                    f.createToken(ts.SyntaxKind.LessThanToken),
                    f.createNumericLiteral(typeDescriptor.minimumItems),
                ),
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
            );
        }

        if (typeDescriptor.maximumItems != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("value"),
                        f.createIdentifier("length"),
                    ),
                    f.createToken(ts.SyntaxKind.GreaterThanToken),
                    f.createNumericLiteral(typeDescriptor.maximumItems),
                ),
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
            );
        }

        if (hasSeenSet) {
            yield f.createVariableStatement(
                undefined,
                f.createVariableDeclarationList([
                    f.createVariableDeclaration(
                        f.createIdentifier("elementValueSeen"),
                        undefined,
                        undefined,
                        f.createNewExpression(
                            f.createIdentifier("Set"),
                            [
                                this.generateTypeReference(typeDescriptor.itemTypeNodeId),
                            ],
                            [],
                        ),
                    ),
                ], ts.NodeFlags.Const),
            );
        }

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
                hasSeenSet ?
                    f.createIfStatement(
                        f.createCallExpression(
                            f.createPropertyAccessExpression(
                                f.createIdentifier("elementValueSeen"),
                                f.createIdentifier("has"),
                            ),
                            undefined,
                            [f.createIdentifier("elementValue")],
                        ),
                        f.createBlock([
                            f.createReturnStatement(f.createFalse()),
                        ], true),
                    ) :
                    f.createEmptyStatement(),
                hasSeenSet ?
                    f.createExpressionStatement(f.createCallExpression(
                        f.createPropertyAccessExpression(
                            f.createIdentifier("elementValueSeen"),
                            f.createIdentifier("add"),
                        ),
                        undefined,
                        [f.createIdentifier("elementValue")],
                    )) :
                    f.createEmptyStatement(),
                f.createIfStatement(
                    f.createPrefixUnaryExpression(
                        ts.SyntaxKind.ExclamationToken,
                        f.createCallExpression(
                            f.createIdentifier(`is${typeName}`),
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
            ].filter(node => !ts.isEmptyStatement(node)), true),
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
                        f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                        f.createStringLiteral("object"),
                    ),
                    f.createToken(ts.SyntaxKind.BarBarToken),
                    f.createBinaryExpression(
                        f.createIdentifier("value"),
                        f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                        f.createNull(),
                    ),
                ),
                f.createToken(ts.SyntaxKind.BarBarToken),
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
                f.createReturnStatement(f.createFalse()),
            ], true),
        );

        for (const propertyName of typeDescriptor.requiredProperties) {
            yield f.createIfStatement(
                f.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    f.createParenthesizedExpression(f.createBinaryExpression(
                        f.createStringLiteral(propertyName),
                        f.createToken(ts.SyntaxKind.InKeyword),
                        f.createIdentifier("value"),
                    )),
                ),
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
            );
        }

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
                                f.createIdentifier(`is${typeName}`),
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

        /*
        We might want this back one day!
        */
        // yield f.createDefaultClause([
        //     f.createReturnStatement(
        //         f.createFalse(),
        //     ),
        // ]);
        /* */
    }

    protected *generateRecordTypeValidationStatements(
        typeDescriptor: RecordTypeDescriptor,
    ): Iterable<ts.Statement> {
        const { factory: f } = this;
        const typeName = this.getTypeName(typeDescriptor.propertyTypeNodeId);

        const hasPropertyCounter =
            typeDescriptor.minimumProperties != null ||
            typeDescriptor.maximumProperties != null;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createBinaryExpression(
                    f.createBinaryExpression(
                        f.createTypeOfExpression(f.createIdentifier("value")),
                        f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                        f.createStringLiteral("object"),
                    ),
                    f.createToken(ts.SyntaxKind.BarBarToken),
                    f.createBinaryExpression(
                        f.createIdentifier("value"),
                        f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                        f.createNull(),
                    ),
                ),
                f.createToken(ts.SyntaxKind.BarBarToken),
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
                f.createReturnStatement(f.createFalse()),
            ], true),
        );

        if (hasPropertyCounter) {
            f.createVariableStatement(
                undefined,
                f.createVariableDeclarationList([
                    f.createVariableDeclaration(
                        f.createIdentifier("propertyCount"),
                        undefined,
                        undefined,
                        f.createNumericLiteral(0),
                    ),
                ], ts.NodeFlags.Let),
            );
        }

        yield f.createForInStatement(
            f.createVariableDeclarationList([
                f.createVariableDeclaration(
                    f.createIdentifier("propertyName"),
                ),
            ], ts.NodeFlags.Const),
            f.createIdentifier("value"),
            f.createBlock([
                hasPropertyCounter ?
                    f.createExpressionStatement(f.createPostfixUnaryExpression(
                        f.createIdentifier("propertyCount"),
                        ts.SyntaxKind.PlusPlusToken,
                    )) :
                    f.createEmptyStatement(),
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
                            f.createIdentifier(`is${typeName}`),
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
            ].filter(node => !ts.isEmptyStatement(node)), true),
        );

        if (hasPropertyCounter) {
            if (typeDescriptor.minimumProperties != null) {
                yield f.createIfStatement(
                    f.createBinaryExpression(
                        f.createIdentifier("propertyCount"),
                        f.createToken(ts.SyntaxKind.LessThanToken),
                        f.createNumericLiteral(typeDescriptor.minimumProperties),
                    ),
                    f.createBlock([
                        f.createReturnStatement(f.createFalse()),
                    ], true),
                );
            }

            if (typeDescriptor.maximumProperties != null) {
                yield f.createIfStatement(
                    f.createBinaryExpression(
                        f.createIdentifier("propertyCount"),
                        f.createToken(ts.SyntaxKind.GreaterThanToken),
                        f.createNumericLiteral(typeDescriptor.maximumProperties),
                    ),
                    f.createBlock([
                        f.createReturnStatement(f.createFalse()),
                    ], true),
                );
            }
        }

        yield f.createReturnStatement(
            f.createTrue(),
        );
    }

    protected *generateOneOfCompoundValidationStatements(
        typeNodeIds: string[],
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createVariableStatement(
            undefined,
            f.createVariableDeclarationList([
                f.createVariableDeclaration(
                    f.createIdentifier("validCounter"),
                    undefined,
                    undefined,
                    f.createNumericLiteral(0),
                ),
            ], ts.NodeFlags.Let),
        );

        for (const typeNodeId of typeNodeIds) {
            const typeName = this.getTypeName(typeNodeId);

            yield f.createIfStatement(
                f.createCallExpression(
                    f.createIdentifier(`is${typeName}`),
                    undefined,
                    [
                        f.createIdentifier("value"),
                    ],
                ),
                f.createBlock([
                    f.createExpressionStatement(f.createPostfixUnaryExpression(
                        f.createIdentifier("validCounter"),
                        ts.SyntaxKind.PlusPlusToken,
                    )),
                ], true),
            );

            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createIdentifier("validCounter"),
                    f.createToken(ts.SyntaxKind.GreaterThanToken),
                    f.createNumericLiteral(1),
                ),
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
            );
        }

        yield f.createReturnStatement(f.createTrue());
    }
    protected *generateAnyOfCompoundValidationStatements(
        typeNodeIds: string[],
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        for (const typeNodeId of typeNodeIds) {
            const typeName = this.getTypeName(typeNodeId);

            yield f.createIfStatement(
                f.createCallExpression(
                    f.createIdentifier(`is${typeName}`),
                    undefined,
                    [
                        f.createIdentifier("value"),
                    ],
                ),
                f.createBlock([
                    f.createReturnStatement(f.createTrue()),
                ], true),
            );
        }

        yield f.createReturnStatement(f.createFalse());
    }
    protected *generateAllOfCompoundValidationStatements(
        typeNodeIds: string[],
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        for (const typeNodeId of typeNodeIds) {
            const typeName = this.getTypeName(typeNodeId);

            yield f.createIfStatement(
                f.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    f.createCallExpression(
                        f.createIdentifier(`is${typeName}`),
                        undefined,
                        [
                            f.createIdentifier("value"),
                        ],
                    ),
                ),
                f.createBlock([
                    f.createReturnStatement(f.createFalse()),
                ], true),
            );
        }

        yield f.createReturnStatement(f.createTrue());
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
