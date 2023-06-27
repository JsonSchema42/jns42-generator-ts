import camelcase from "camelcase";
import ts from "typescript";
import {
    ArrayType,
    BooleanType,
    CompoundUnion,
    InterfaceType,
    NumberType,
    RecordType,
    StringType,
    TupleType,
    TypeUnion,
} from "../schema/intermediate.js";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class ValidatorsTsCodeGenerator extends CodeGeneratorBase {
    public *getStatements() {
        for (const nodeId in this.nodes) {
            yield* this.generateValidatorFunctionDeclarationStatements(nodeId);
        }
    }

    protected *generateValidatorFunctionDeclarationStatements(
        nodeId: string
    ): Iterable<ts.FunctionDeclaration> {
        const { factory: f } = this;
        const node = this.nodes[nodeId];

        const typeName = this.getTypeName(nodeId);

        yield f.createFunctionDeclaration(
            [f.createToken(ts.SyntaxKind.ExportKeyword)],
            undefined,
            `is${typeName}`,
            undefined,
            [
                f.createParameterDeclaration(
                    undefined,
                    undefined,
                    "value",
                    undefined,
                    f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                ),
            ],
            f.createTypePredicateNode(
                undefined,
                f.createIdentifier("value"),
                this.generateTypeReference(nodeId)
            ),
            f.createBlock([...this.generateValidatorFunctionBodyStatements(nodeId)], true)
        );

        for (const typeNode of node.types) {
            yield f.createFunctionDeclaration(
                undefined,
                undefined,
                `is${camelcase(typeNode.type, {
                    pascalCase: true,
                })}${typeName}`,
                undefined,
                [
                    f.createParameterDeclaration(
                        undefined,
                        undefined,
                        "value",
                        undefined,
                        f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                    ),
                ],
                f.createTypePredicateNode(
                    undefined,
                    f.createIdentifier("value"),
                    f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                ),
                f.createBlock([...this.generateTypeValidationStatements(nodeId, typeNode)], true)
            );
        }

        for (const compoundNode of node.compounds) {
            yield f.createFunctionDeclaration(
                undefined,
                undefined,
                `is${camelcase(compoundNode.type, {
                    pascalCase: true,
                })}${typeName}`,
                undefined,
                [
                    f.createParameterDeclaration(
                        undefined,
                        undefined,
                        "value",
                        undefined,
                        f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                    ),
                ],
                f.createTypePredicateNode(
                    undefined,
                    f.createIdentifier("value"),
                    f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                ),
                f.createBlock(
                    [...this.generateCompoundValidationStatements(nodeId, compoundNode)],
                    true
                )
            );
        }
    }

    protected *generateValidatorFunctionBodyStatements(nodeId: string): Iterable<ts.Statement> {
        const { factory: f } = this;
        const node = this.nodes[nodeId];

        const typeName = this.getTypeName(nodeId);

        if (node.superNodeId != null) {
            const referencingTypeName = this.getTypeName(node.superNodeId);

            yield f.createIfStatement(
                f.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    f.createCallExpression(
                        f.createIdentifier(`is${referencingTypeName}`),
                        undefined,
                        [f.createIdentifier("value")]
                    )
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        if (node.types.length > 0) {
            yield f.createIfStatement(
                f.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    f.createParenthesizedExpression(
                        node.types
                            .map(
                                (type) =>
                                    f.createCallExpression(
                                        f.createIdentifier(
                                            `is${camelcase(type.type, {
                                                pascalCase: true,
                                            })}${typeName}`
                                        ),
                                        undefined,
                                        [f.createIdentifier("value")]
                                    ) as ts.Expression
                            )
                            .reduce((a, b) =>
                                f.createBinaryExpression(
                                    a,
                                    f.createToken(ts.SyntaxKind.BarBarToken),
                                    b
                                )
                            )
                    )
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        if (node.compounds.length > 0) {
            yield f.createIfStatement(
                f.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    f.createParenthesizedExpression(
                        node.compounds
                            .map(
                                (compound) =>
                                    f.createCallExpression(
                                        f.createIdentifier(
                                            `is${camelcase(compound.type, {
                                                pascalCase: true,
                                            })}${typeName}`
                                        ),
                                        undefined,
                                        [f.createIdentifier("value")]
                                    ) as ts.Expression
                            )
                            .reduce((a, b) =>
                                f.createBinaryExpression(
                                    a,
                                    f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                                    b
                                )
                            )
                    )
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        yield f.createReturnStatement(f.createTrue());
    }

    protected generateTypeValidationStatements(nodeId: string, type: TypeUnion) {
        switch (type.type) {
            case "never":
                return this.generateNeverTypeValidationStatements();

            case "any":
                return this.generateAnyTypeValidationStatements();

            case "null":
                return this.generateNullTypeValidationStatements();

            case "boolean":
                return this.generateBooleanTypeValidationStatements(type);

            case "number":
                return this.generateNumberTypeValidationStatements(type);

            case "string":
                return this.generateStringTypeValidationStatements(type);

            case "tuple":
                return this.generateTupleTypeValidationStatements(type);

            case "array":
                return this.generateArrayTypeValidationStatements(type);

            case "interface":
                return this.generateInterfaceTypeValidationStatements(type);

            case "record":
                return this.generateRecordTypeValidationStatements(type);

            default:
                throw new Error("type not supported");
        }
    }

    protected generateCompoundValidationStatements(nodeId: string, compound: CompoundUnion) {
        switch (compound.type) {
            case "one-of":
                return this.generateOneOfCompoundValidationStatements(compound.typeNodeIds);

            case "any-of":
                return this.generateAnyOfCompoundValidationStatements(compound.typeNodeIds);

            case "all-of":
                return this.generateAllOfCompoundValidationStatements(compound.typeNodeIds);

            default:
                throw new Error("type not supported");
        }
    }

    protected *generateNeverTypeValidationStatements(): Iterable<ts.Statement> {
        const { factory: f } = this;
        /*
        never never validates
        */
        yield f.createReturnStatement(f.createFalse());
    }
    protected *generateAnyTypeValidationStatements(): Iterable<ts.Statement> {
        const { factory: f } = this;

        /*
        any is always valid
        */
        yield f.createReturnStatement(f.createTrue());
    }
    protected *generateNullTypeValidationStatements(): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createIdentifier("value"),
                f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                f.createNull()
            ),
            f.createBlock([f.createReturnStatement(f.createTrue())], true)
        );
    }
    protected *generateBooleanTypeValidationStatements(type: BooleanType): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createTypeOfExpression(f.createIdentifier("value")),
                f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                f.createStringLiteral("boolean")
            ),
            f.createBlock([f.createReturnStatement(f.createFalse())], true)
        );

        if (type.options != null) {
            yield f.createIfStatement(
                type.options
                    .map((option) =>
                        f.createBinaryExpression(
                            f.createIdentifier("value"),
                            f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                            option ? f.createTrue() : f.createFalse()
                        )
                    )
                    .reduce((a, b) =>
                        f.createBinaryExpression(
                            a,
                            f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                            b
                        )
                    ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        yield f.createReturnStatement(f.createTrue());
    }

    protected *generateNumberTypeValidationStatements(type: NumberType): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createBinaryExpression(
                    f.createTypeOfExpression(f.createIdentifier("value")),
                    f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                    f.createStringLiteral("number")
                ),
                f.createToken(ts.SyntaxKind.BarBarToken),
                f.createCallExpression(f.createIdentifier("isNaN"), undefined, [
                    f.createIdentifier("value"),
                ])
            ),
            f.createBlock([f.createReturnStatement(f.createFalse())], true)
        );

        switch (type.numberType) {
            case "integer": {
                yield f.createIfStatement(
                    f.createBinaryExpression(
                        f.createBinaryExpression(
                            f.createIdentifier("value"),
                            f.createToken(ts.SyntaxKind.PercentToken),
                            f.createNumericLiteral(1)
                        ),
                        f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                        f.createNumericLiteral(0)
                    ),
                    f.createBlock([f.createReturnStatement(f.createFalse())], true)
                );
                break;
            }

            case "float": {
                break;
            }

            default:
                throw new TypeError(`unexpected numberType (${type.numberType})`);
        }

        if (type.minimumInclusive != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createIdentifier("value"),
                    f.createToken(ts.SyntaxKind.LessThanToken),
                    f.createNumericLiteral(type.minimumInclusive)
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        if (type.minimumExclusive != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createIdentifier("value"),
                    f.createToken(ts.SyntaxKind.LessThanEqualsToken),
                    f.createNumericLiteral(type.minimumExclusive)
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        if (type.maximumInclusive != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createIdentifier("value"),
                    f.createToken(ts.SyntaxKind.GreaterThanToken),
                    f.createNumericLiteral(type.maximumInclusive)
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        if (type.maximumExclusive != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createIdentifier("value"),
                    f.createToken(ts.SyntaxKind.GreaterThanEqualsToken),
                    f.createNumericLiteral(type.maximumExclusive)
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        if (type.multipleOf != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createBinaryExpression(
                        f.createIdentifier("value"),
                        f.createToken(ts.SyntaxKind.PercentToken),
                        f.createNumericLiteral(type.multipleOf)
                    ),
                    f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                    f.createNumericLiteral(0)
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        if (type.options != null) {
            yield f.createIfStatement(
                type.options
                    .map((option) =>
                        f.createBinaryExpression(
                            f.createIdentifier("value"),
                            f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                            f.createNumericLiteral(option)
                        )
                    )
                    .reduce((a, b) =>
                        f.createBinaryExpression(
                            a,
                            f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                            b
                        )
                    ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        yield f.createReturnStatement(f.createTrue());
    }
    protected *generateStringTypeValidationStatements(type: StringType): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createTypeOfExpression(f.createIdentifier("value")),
                f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                f.createStringLiteral("string")
            ),
            f.createBlock([f.createReturnStatement(f.createFalse())], true)
        );

        if (type.minimumLength != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("value"),
                        f.createIdentifier("length")
                    ),
                    f.createToken(ts.SyntaxKind.LessThanToken),
                    f.createNumericLiteral(type.minimumLength)
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        if (type.maximumLength != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("value"),
                        f.createIdentifier("length")
                    ),
                    f.createToken(ts.SyntaxKind.GreaterThanToken),
                    f.createNumericLiteral(type.maximumLength)
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        if (type.valuePattern != null) {
            yield f.createIfStatement(
                f.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    f.createCallExpression(
                        f.createPropertyAccessExpression(
                            f.createRegularExpressionLiteral(`/${type.valuePattern}/`),
                            f.createIdentifier("test")
                        ),
                        undefined,
                        [f.createIdentifier("value")]
                    )
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        if (type.options != null) {
            yield f.createIfStatement(
                type.options
                    .map((option) =>
                        f.createBinaryExpression(
                            f.createIdentifier("value"),
                            f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                            f.createStringLiteral(option)
                        )
                    )
                    .reduce((a, b) =>
                        f.createBinaryExpression(
                            a,
                            f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                            b
                        )
                    ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        yield f.createReturnStatement(f.createTrue());
    }
    protected *generateTupleTypeValidationStatements(type: TupleType): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createPrefixUnaryExpression(
                ts.SyntaxKind.ExclamationToken,
                f.createCallExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("Array"),
                        f.createIdentifier("isArray")
                    ),
                    undefined,
                    [f.createIdentifier("value")]
                )
            ),
            f.createBlock([f.createReturnStatement(f.createFalse())], true)
        );

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createPropertyAccessExpression(
                    f.createIdentifier("value"),
                    f.createIdentifier("length")
                ),
                f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                f.createNumericLiteral(type.itemTypeNodeIds.length)
            ),
            f.createBlock([f.createReturnStatement(f.createFalse())], true)
        );

        yield f.createForInStatement(
            f.createVariableDeclarationList(
                [f.createVariableDeclaration(f.createIdentifier("elementIndex"))],
                ts.NodeFlags.Const
            ),
            f.createIdentifier("value"),
            f.createBlock(
                [
                    f.createVariableStatement(
                        undefined,
                        f.createVariableDeclarationList(
                            [
                                f.createVariableDeclaration(
                                    f.createIdentifier("elementValue"),
                                    undefined,
                                    undefined,
                                    f.createElementAccessExpression(
                                        f.createIdentifier("value"),
                                        f.createIdentifier("elementIndex")
                                    )
                                ),
                            ],
                            ts.NodeFlags.Const
                        )
                    ),
                    f.createSwitchStatement(
                        f.createIdentifier("elementIndex"),
                        f.createCaseBlock([
                            ...this.generateTupleTypeCaseClausesValidationStatements(type),
                        ])
                    ),
                ],
                true
            )
        );

        yield f.createReturnStatement(f.createTrue());
    }
    private *generateTupleTypeCaseClausesValidationStatements(
        type: TupleType
    ): Iterable<ts.CaseOrDefaultClause> {
        const { factory: f } = this;

        for (const elementIndex in type.itemTypeNodeIds) {
            const itemTypeNodeId = type.itemTypeNodeIds[elementIndex];
            const typeName = this.getTypeName(itemTypeNodeId);

            yield f.createCaseClause(f.createNumericLiteral(elementIndex), [
                f.createIfStatement(
                    f.createPrefixUnaryExpression(
                        ts.SyntaxKind.ExclamationToken,
                        f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
                            f.createIdentifier("elementValue"),
                        ])
                    ),
                    f.createBlock([f.createReturnStatement(f.createFalse())], true)
                ),
                f.createBreakStatement(),
            ]);
        }

        yield f.createDefaultClause([f.createReturnStatement(f.createFalse())]);
    }

    protected *generateArrayTypeValidationStatements(type: ArrayType): Iterable<ts.Statement> {
        const { factory: f } = this;
        const typeName = this.getTypeName(type.itemTypeNodeId);
        const hasSeenSet = type.uniqueItems ?? false;

        yield f.createIfStatement(
            f.createPrefixUnaryExpression(
                ts.SyntaxKind.ExclamationToken,
                f.createCallExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("Array"),
                        f.createIdentifier("isArray")
                    ),
                    undefined,
                    [f.createIdentifier("value")]
                )
            ),
            f.createBlock([f.createReturnStatement(f.createFalse())], true)
        );

        if (type.minimumItems != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("value"),
                        f.createIdentifier("length")
                    ),
                    f.createToken(ts.SyntaxKind.LessThanToken),
                    f.createNumericLiteral(type.minimumItems)
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        if (type.maximumItems != null) {
            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("value"),
                        f.createIdentifier("length")
                    ),
                    f.createToken(ts.SyntaxKind.GreaterThanToken),
                    f.createNumericLiteral(type.maximumItems)
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        if (hasSeenSet) {
            yield f.createVariableStatement(
                undefined,
                f.createVariableDeclarationList(
                    [
                        f.createVariableDeclaration(
                            f.createIdentifier("elementValueSeen"),
                            undefined,
                            undefined,
                            f.createNewExpression(
                                f.createIdentifier("Set"),
                                [this.generateTypeReference(type.itemTypeNodeId)],
                                []
                            )
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            );
        }

        yield f.createForInStatement(
            f.createVariableDeclarationList(
                [f.createVariableDeclaration(f.createIdentifier("elementIndex"))],
                ts.NodeFlags.Const
            ),
            f.createIdentifier("value"),
            f.createBlock(
                [
                    f.createVariableStatement(
                        undefined,
                        f.createVariableDeclarationList(
                            [
                                f.createVariableDeclaration(
                                    f.createIdentifier("elementValue"),
                                    undefined,
                                    undefined,
                                    f.createElementAccessExpression(
                                        f.createIdentifier("value"),
                                        f.createIdentifier("elementIndex")
                                    )
                                ),
                            ],
                            ts.NodeFlags.Const
                        )
                    ),
                    hasSeenSet
                        ? f.createIfStatement(
                              f.createCallExpression(
                                  f.createPropertyAccessExpression(
                                      f.createIdentifier("elementValueSeen"),
                                      f.createIdentifier("has")
                                  ),
                                  undefined,
                                  [f.createIdentifier("elementValue")]
                              ),
                              f.createBlock([f.createReturnStatement(f.createFalse())], true)
                          )
                        : f.createEmptyStatement(),
                    hasSeenSet
                        ? f.createExpressionStatement(
                              f.createCallExpression(
                                  f.createPropertyAccessExpression(
                                      f.createIdentifier("elementValueSeen"),
                                      f.createIdentifier("add")
                                  ),
                                  undefined,
                                  [f.createIdentifier("elementValue")]
                              )
                          )
                        : f.createEmptyStatement(),
                    f.createIfStatement(
                        f.createPrefixUnaryExpression(
                            ts.SyntaxKind.ExclamationToken,
                            f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
                                f.createIdentifier("elementValue"),
                            ])
                        ),
                        f.createBlock([f.createReturnStatement(f.createFalse())], true)
                    ),
                ].filter((node) => !ts.isEmptyStatement(node)),
                true
            )
        );

        yield f.createReturnStatement(f.createTrue());
    }
    protected *generateInterfaceTypeValidationStatements(
        type: InterfaceType
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createBinaryExpression(
                    f.createBinaryExpression(
                        f.createTypeOfExpression(f.createIdentifier("value")),
                        f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                        f.createStringLiteral("object")
                    ),
                    f.createToken(ts.SyntaxKind.BarBarToken),
                    f.createBinaryExpression(
                        f.createIdentifier("value"),
                        f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                        f.createNull()
                    )
                ),
                f.createToken(ts.SyntaxKind.BarBarToken),
                f.createCallExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("Array"),
                        f.createIdentifier("isArray")
                    ),
                    undefined,
                    [f.createIdentifier("value")]
                )
            ),
            f.createBlock([f.createReturnStatement(f.createFalse())], true)
        );

        for (const propertyName of type.requiredProperties) {
            yield f.createIfStatement(
                f.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    f.createParenthesizedExpression(
                        f.createBinaryExpression(
                            f.createStringLiteral(propertyName),
                            f.createToken(ts.SyntaxKind.InKeyword),
                            f.createIdentifier("value")
                        )
                    )
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        yield f.createForInStatement(
            f.createVariableDeclarationList(
                [f.createVariableDeclaration(f.createIdentifier("propertyName"))],
                ts.NodeFlags.Const
            ),
            f.createIdentifier("value"),
            f.createBlock(
                [
                    f.createVariableStatement(
                        undefined,
                        f.createVariableDeclarationList(
                            [
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
                                                f.createTypeQueryNode(f.createIdentifier("value"))
                                            )
                                        )
                                    )
                                ),
                            ],
                            ts.NodeFlags.Const
                        )
                    ),
                    f.createSwitchStatement(
                        f.createIdentifier("propertyName"),
                        f.createCaseBlock([
                            ...this.generateInterfaceTypeCaseClausesValidationStatements(type),
                        ])
                    ),
                ],
                true
            )
        );

        yield f.createReturnStatement(f.createTrue());
    }
    private *generateInterfaceTypeCaseClausesValidationStatements(
        type: InterfaceType
    ): Iterable<ts.CaseOrDefaultClause> {
        const { factory: f } = this;

        for (const propertyName in type.propertyTypeNodeIds) {
            const propertyTypeNodeId = type.propertyTypeNodeIds[propertyName];
            const typeName = this.getTypeName(propertyTypeNodeId);

            yield f.createCaseClause(f.createStringLiteral(propertyName), [
                f.createIfStatement(
                    f.createPrefixUnaryExpression(
                        ts.SyntaxKind.ExclamationToken,
                        f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
                            f.createIdentifier("propertyValue"),
                        ])
                    ),
                    f.createBlock([f.createReturnStatement(f.createFalse())], true)
                ),
                f.createBreakStatement(),
            ]);
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

    protected *generateRecordTypeValidationStatements(type: RecordType): Iterable<ts.Statement> {
        const { factory: f } = this;
        const typeName = this.getTypeName(type.propertyTypeNodeId);

        const hasPropertyCounter = type.minimumProperties != null || type.maximumProperties != null;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createBinaryExpression(
                    f.createBinaryExpression(
                        f.createTypeOfExpression(f.createIdentifier("value")),
                        f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                        f.createStringLiteral("object")
                    ),
                    f.createToken(ts.SyntaxKind.BarBarToken),
                    f.createBinaryExpression(
                        f.createIdentifier("value"),
                        f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                        f.createNull()
                    )
                ),
                f.createToken(ts.SyntaxKind.BarBarToken),
                f.createCallExpression(
                    f.createPropertyAccessExpression(
                        f.createIdentifier("Array"),
                        f.createIdentifier("isArray")
                    ),
                    undefined,
                    [f.createIdentifier("value")]
                )
            ),
            f.createBlock([f.createReturnStatement(f.createFalse())], true)
        );

        if (hasPropertyCounter) {
            f.createVariableStatement(
                undefined,
                f.createVariableDeclarationList(
                    [
                        f.createVariableDeclaration(
                            f.createIdentifier("propertyCount"),
                            undefined,
                            undefined,
                            f.createNumericLiteral(0)
                        ),
                    ],
                    ts.NodeFlags.Let
                )
            );
        }

        yield f.createForInStatement(
            f.createVariableDeclarationList(
                [f.createVariableDeclaration(f.createIdentifier("propertyName"))],
                ts.NodeFlags.Const
            ),
            f.createIdentifier("value"),
            f.createBlock(
                [
                    hasPropertyCounter
                        ? f.createExpressionStatement(
                              f.createPostfixUnaryExpression(
                                  f.createIdentifier("propertyCount"),
                                  ts.SyntaxKind.PlusPlusToken
                              )
                          )
                        : f.createEmptyStatement(),
                    f.createVariableStatement(
                        undefined,
                        f.createVariableDeclarationList(
                            [
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
                                                f.createTypeQueryNode(f.createIdentifier("value"))
                                            )
                                        )
                                    )
                                ),
                            ],
                            ts.NodeFlags.Const
                        )
                    ),
                    f.createIfStatement(
                        f.createPrefixUnaryExpression(
                            ts.SyntaxKind.ExclamationToken,
                            f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
                                f.createIdentifier("propertyValue"),
                            ])
                        ),
                        f.createBlock([f.createReturnStatement(f.createFalse())], true)
                    ),
                ].filter((node) => !ts.isEmptyStatement(node)),
                true
            )
        );

        if (hasPropertyCounter) {
            if (type.minimumProperties != null) {
                yield f.createIfStatement(
                    f.createBinaryExpression(
                        f.createIdentifier("propertyCount"),
                        f.createToken(ts.SyntaxKind.LessThanToken),
                        f.createNumericLiteral(type.minimumProperties)
                    ),
                    f.createBlock([f.createReturnStatement(f.createFalse())], true)
                );
            }

            if (type.maximumProperties != null) {
                yield f.createIfStatement(
                    f.createBinaryExpression(
                        f.createIdentifier("propertyCount"),
                        f.createToken(ts.SyntaxKind.GreaterThanToken),
                        f.createNumericLiteral(type.maximumProperties)
                    ),
                    f.createBlock([f.createReturnStatement(f.createFalse())], true)
                );
            }
        }

        yield f.createReturnStatement(f.createTrue());
    }

    protected *generateOneOfCompoundValidationStatements(
        typeNodeIds: string[]
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createVariableStatement(
            undefined,
            f.createVariableDeclarationList(
                [
                    f.createVariableDeclaration(
                        f.createIdentifier("validCounter"),
                        undefined,
                        undefined,
                        f.createNumericLiteral(0)
                    ),
                ],
                ts.NodeFlags.Let
            )
        );

        for (const typeNodeId of typeNodeIds) {
            const typeName = this.getTypeName(typeNodeId);

            yield f.createIfStatement(
                f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
                    f.createIdentifier("value"),
                ]),
                f.createBlock(
                    [
                        f.createExpressionStatement(
                            f.createPostfixUnaryExpression(
                                f.createIdentifier("validCounter"),
                                ts.SyntaxKind.PlusPlusToken
                            )
                        ),
                    ],
                    true
                )
            );

            yield f.createIfStatement(
                f.createBinaryExpression(
                    f.createIdentifier("validCounter"),
                    f.createToken(ts.SyntaxKind.GreaterThanToken),
                    f.createNumericLiteral(1)
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        yield f.createReturnStatement(f.createTrue());
    }
    protected *generateAnyOfCompoundValidationStatements(
        typeNodeIds: string[]
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        for (const typeNodeId of typeNodeIds) {
            const typeName = this.getTypeName(typeNodeId);

            yield f.createIfStatement(
                f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
                    f.createIdentifier("value"),
                ]),
                f.createBlock([f.createReturnStatement(f.createTrue())], true)
            );
        }

        yield f.createReturnStatement(f.createFalse());
    }
    protected *generateAllOfCompoundValidationStatements(
        typeNodeIds: string[]
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        for (const typeNodeId of typeNodeIds) {
            const typeName = this.getTypeName(typeNodeId);

            yield f.createIfStatement(
                f.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
                        f.createIdentifier("value"),
                    ])
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true)
            );
        }

        yield f.createReturnStatement(f.createTrue());
    }
}
