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

        yield f.createReturnStatement(
            f.createTrue(),
        );
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

        yield f.createReturnStatement(
            f.createTrue(),
        );
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

    protected generateTypeReference(
        nodeId: string,
    ) {
        const { factory: f } = this;

        const typeName = this.namer.getName(nodeId).join("_");
        return f.createTypeReferenceNode(
            f.createQualifiedName(
                f.createIdentifier("types"),
                f.createIdentifier(typeName),
            ),
        );
    }

}
