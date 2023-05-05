import ts from "typescript";
import { TypeDescriptorUnion } from "../schema/type-descriptors.js";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class ValidatorsTsCodeGenerator extends CodeGeneratorBase {

    public * getStatements() {
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
                return this.generateBooleanTypeValidationStatements();

            case "number":
                return this.generateNumberTypeValidationStatements();

            case "string":
                return this.generateStringTypeValidationStatements();

            case "tuple":
                return this.generateTupleTypeValidationStatements(
                    typeDescriptor.itemTypeNodeIds,
                );

            case "array":
                return this.generateArrayTypeValidationStatements(
                    typeDescriptor.itemTypeNodeId,
                );

            case "interface":
                return this.generateInterfaceTypeValidationStatements(
                    typeDescriptor.propertyTypeNodeIds,
                    new Set(typeDescriptor.requiredProperties),
                );

            case "record":
                return this.generateRecordTypeValidationStatements(
                    typeDescriptor.propertyTypeNodeId,
                );

            case "union":
                return this.generateUnionTypeValidationStatements(
                    typeDescriptor.typeNodeIds,
                );

            case "intersection":
                return this.generateIntersectionTypeValidationStatements(
                    typeDescriptor.typeNodeIds,
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
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createIfStatement(
            f.createBinaryExpression(
                f.createTypeOfExpression(f.createIdentifier("value")),
                f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                f.createStringLiteral("boolean"),
            ),
            f.createBlock([
                ...this.generateBooleanTypeInnerValidationStatements(),
            ], true),
        );
    }
    protected *generateBooleanTypeInnerValidationStatements(
    ): Iterable<ts.Statement> {
        const { factory: f } = this;

        yield f.createReturnStatement(
            f.createTrue(),
        );
    }
    protected *generateNumberTypeValidationStatements(
    ): Iterable<ts.Statement> {
        yield* [];
    }
    protected *generateStringTypeValidationStatements(
    ): Iterable<ts.Statement> {
        yield* [];
    }
    protected *generateTupleTypeValidationStatements(
        nodeIds: Array<string | boolean>,
    ): Iterable<ts.Statement> {
        yield* [];
    }
    protected *generateArrayTypeValidationStatements(
        nodeId: string | boolean,
    ): Iterable<ts.Statement> {
        yield* [];
    }
    protected *generateInterfaceTypeValidationStatements(
        nodeIds: Record<string, string | boolean>,
        required: Set<string>,
    ): Iterable<ts.Statement> {
        yield* [];
    }
    protected *generateRecordTypeValidationStatements(
        nodeId: string | boolean,
    ): Iterable<ts.Statement> {
        yield* [];
    }
    protected *generateUnionTypeValidationStatements(
        nodeIds: Array<string | boolean>,
    ): Iterable<ts.Statement> {
        yield* [];
    }
    protected *generateIntersectionTypeValidationStatements(
        nodeIds: Array<string | boolean>,
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
