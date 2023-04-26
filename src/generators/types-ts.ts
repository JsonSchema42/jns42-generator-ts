import ts from "typescript";
import { TypeDescriptorUnion } from "../schema/type-descriptors.js";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class TypesTsCodeGenerator extends CodeGeneratorBase {

    public * getStatements() {
        for (const [nodeId, typeName] of this.manager.getTypeNames()) {
            yield* this.generateNodeStatements(nodeId);
        }
    }

    protected * generateNodeStatements(
        nodeId: string,
    ) {
        const typeName = this.namer.getName(nodeId).join("_");

        yield this.generateSchemaTypeDeclarationStatement(
            nodeId,
            typeName,
        );

    }

    protected generateNeverTypeDefinition(): ts.TypeNode {
        return this.factory.createKeywordTypeNode(
            ts.SyntaxKind.NeverKeyword,
        );
    }
    protected generateAnyTypeDefinition(): ts.TypeNode {
        return this.factory.createKeywordTypeNode(
            ts.SyntaxKind.AnyKeyword,
        );
    }
    protected generateNullTypeDefinition(): ts.TypeNode {
        return this.factory.createLiteralTypeNode(
            this.factory.createNull(),
        );
    }
    protected generateBooleanTypeDefinition(): ts.TypeNode {
        return this.factory.createKeywordTypeNode(
            ts.SyntaxKind.BooleanKeyword,
        );
    }
    protected generateNumberTypeDefinition(): ts.TypeNode {
        return this.factory.createKeywordTypeNode(
            ts.SyntaxKind.NumberKeyword,
        );
    }
    protected generateStringTypeDefinition(): ts.TypeNode {
        return this.factory.createKeywordTypeNode(
            ts.SyntaxKind.StringKeyword,
        );
    }
    protected generateTupleTypeDefinition(
        nodeIds: Array<string | boolean>,
    ): ts.TypeNode {
        const elements = nodeIds.map(nodeId => this.generateTypeReferenceOrAnyOrNever(nodeId));
        return this.factory.createTupleTypeNode(elements);
    }
    protected generateArrayTypeDefinition(
        nodeId: string | boolean,
    ): ts.TypeNode {
        const element = this.generateTypeReferenceOrAnyOrNever(nodeId);
        return this.factory.createArrayTypeNode(element);
    }
    protected generateInterfaceTypeDefinition(
        nodeIds: Record<string, string | boolean>,
        required: Set<string>,
    ): ts.TypeNode {
        const members = Object.entries(nodeIds).
            map(([name, nodeId]) => this.factory.createPropertySignature(
                undefined,
                this.factory.createIdentifier(name),
                required.has(name) ?
                    undefined :
                    this.factory.createToken(ts.SyntaxKind.QuestionToken),
                this.generateTypeReferenceOrAnyOrNever(nodeId),
            ));
        return this.factory.createTypeLiteralNode(members);
    }
    protected generateRecordTypeDefinition(
        nodeId: string | boolean,
    ): ts.TypeNode {
        const element = this.generateTypeReferenceOrAnyOrNever(nodeId);
        return this.factory.createTypeReferenceNode(
            this.factory.createIdentifier("Record"),
            [
                this.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                element,
            ],
        );
    }

    protected generateUnionTypeDefinition(
        nodeIds: Array<string | boolean>,
    ) {
        const types = nodeIds.map(nodeId => this.generateTypeReferenceOrAnyOrNever(nodeId));
        return this.factory.createUnionTypeNode(types);
    }

    protected generateIntersectionTypeDefinition(
        nodeIds: Array<string | boolean>,
    ) {
        const types = nodeIds.map(nodeId => this.generateTypeReferenceOrAnyOrNever(nodeId));
        return this.factory.createIntersectionTypeNode(types);
    }

    protected generateTypeReference(
        nodeId: string,
    ) {
        const typeName = this.namer.getName(nodeId).join("_");
        return this.factory.createTypeReferenceNode(
            this.factory.createIdentifier(typeName),
        );
    }

    protected generateTypeReferenceOrAnyOrNever(
        nodeId: string | boolean,
    ) {
        if (nodeId === true) {
            return this.generateAnyTypeDefinition();

        }
        if (nodeId === false) {
            return this.generateNeverTypeDefinition();
        }

        return this.generateTypeReference(nodeId);
    }

    protected generateSchemaTypeDeclarationStatement(
        nodeId: string,
        typeName: string,
    ) {
        const declaration = this.factory.createTypeAliasDeclaration(
            [
                this.factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            typeName,
            undefined,
            this.generateComposedTypeNode(
                nodeId,
            ),
        );

        const comments = this.manager.getComments(nodeId);
        if (comments.length > 0) {
            ts.addSyntheticLeadingComment(
                declaration,
                ts.SyntaxKind.MultiLineCommentTrivia,
                "*\n" + comments,
                true,
            );
        }

        return declaration;
    }

    protected *generateTypeNodes(
        nodeId: string,
    ): Iterable<ts.TypeNode> {
        for (const typeDescriptor of this.manager.selectNodeTypeDescriptors(nodeId)) {
            yield this.generateTypeDefinition(nodeId, typeDescriptor);
        }
    }

    protected generateComposedTypeNode(
        nodeId: string,
    ): ts.TypeNode {
        const typeNodes = [...this.generateTypeNodes(nodeId)];
        const node = typeNodes.length === 0 ?
            this.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword) :
            this.factory.createParenthesizedType(this.factory.createUnionTypeNode(
                typeNodes,
            ));
        return node;
    }

    protected generateTypeDefinition(
        nodeId: string,
        typeDescriptor: TypeDescriptorUnion,
    ): ts.TypeNode {
        switch (typeDescriptor.type) {
            case "never":
                return this.generateNeverTypeDefinition();

            case "any":
                return this.generateAnyTypeDefinition();

            case "null":
                return this.generateNullTypeDefinition();

            case "boolean":
                return this.generateBooleanTypeDefinition();

            case "number":
                return this.generateNumberTypeDefinition();

            case "string":
                return this.generateStringTypeDefinition();

            case "tuple":
                return this.generateTupleTypeDefinition(
                    typeDescriptor.itemTypeNodeIds,
                );

            case "array":
                return this.generateArrayTypeDefinition(
                    typeDescriptor.itemTypeNodeId,
                );

            case "interface":
                return this.generateInterfaceTypeDefinition(
                    typeDescriptor.propertyTypeNodeIds,
                    new Set(typeDescriptor.requiredProperties),
                );

            case "record":
                return this.generateRecordTypeDefinition(
                    typeDescriptor.propertyTypeNodeId,
                );

            case "union":
                return this.generateUnionTypeDefinition(
                    typeDescriptor.typeNodeIds,
                );

            case "intersection":
                return this.generateIntersectionTypeDefinition(
                    typeDescriptor.typeNodeIds,
                );

            default:
                throw new Error("type not supported");
        }
    }

}
