import ts from "typescript";
import { CompoundDescriptorUnion } from "../schema/index.js";
import { TypeDescriptorUnion } from "../schema/type-descriptors.js";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class TypesTsCodeGenerator extends CodeGeneratorBase {

    public * getStatements() {
        for (const [nodeId] of this.context.getTypeNames()) {
            yield this.generateTypeDeclarationStatement(
                nodeId,
            );
        }
    }

    protected generateTypeDeclarationStatement(
        nodeId: string,
    ) {
        const typeDefinition = this.generateTypeDefinition(
            nodeId,
        );

        const typeName = this.getTypeName(nodeId);
        const declaration = this.factory.createTypeAliasDeclaration(
            [
                this.factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            typeName,
            undefined,
            typeDefinition,
        );

        const comments = this.context.getComments(nodeId);
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

    protected generateTypeDefinition(
        nodeId: string,
    ): ts.TypeNode {
        const { factory: f } = this;

        const typeNodes = [...this.generateTypeDefinitionElements(nodeId)];
        const compoundNodes = [...this.generateCompoundDefinitionElements(nodeId)];

        const referencingNodeId = this.context.getReferencingNodeId(nodeId);

        let node: ts.TypeNode | undefined;
        if (compoundNodes.length > 0) {
            const typeNode = f.createParenthesizedType(f.createIntersectionTypeNode(
                compoundNodes,
            ));
            node = node == null ?
                typeNode :
                f.createParenthesizedType(f.createIntersectionTypeNode([
                    node,
                    typeNode,
                ]));
        }
        if (typeNodes.length > 0) {
            const typeNode = f.createParenthesizedType(f.createUnionTypeNode(
                typeNodes,
            ));
            node = node == null ?
                typeNode :
                f.createParenthesizedType(f.createIntersectionTypeNode([
                    node,
                    typeNode,
                ]));
        }
        if (referencingNodeId != null) {
            const typeNode = this.generateTypeReference(referencingNodeId);
            node = node == null ?
                typeNode :
                f.createParenthesizedType(f.createIntersectionTypeNode([
                    node,
                    typeNode,
                ]));
        }

        if (node == null) {
            node = f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
        }

        return node;
    }

    protected *generateCompoundDefinitionElements(
        nodeId: string,
    ): Iterable<ts.TypeNode> {
        for (const compoundDescriptor of this.context.selectNodeCompoundDescriptors(nodeId)) {
            yield this.generateCompoundDefinitionElement(compoundDescriptor);
        }
    }

    protected *generateTypeDefinitionElements(
        nodeId: string,
    ): Iterable<ts.TypeNode> {
        for (const typeDescriptor of this.context.selectNodeTypeDescriptors(nodeId)) {
            yield this.generateTypeDefinitionElement(typeDescriptor);
        }
    }

    protected generateTypeDefinitionElement(
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

            default:
                throw new Error("type not supported");
        }
    }

    protected generateCompoundDefinitionElement(
        compoundDescriptor: CompoundDescriptorUnion,
    ): ts.TypeNode {
        switch (compoundDescriptor.type) {
            case "one-of":
                return this.generateOneOfCompoundDefinition(
                    compoundDescriptor.typeNodeIds,
                );

            case "any-of":
                return this.generateAnyOfCompoundDefinition(
                    compoundDescriptor.typeNodeIds,
                );

            case "all-of":
                return this.generateAllOfCompoundDefinition(
                    compoundDescriptor.typeNodeIds,
                );

            default:
                throw new Error("type not supported");
        }
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
        nodeIds: Array<string>,
    ): ts.TypeNode {
        const elements = nodeIds.map(nodeId => this.generateTypeReference(nodeId));
        return this.factory.createTupleTypeNode(elements);
    }
    protected generateArrayTypeDefinition(
        nodeId: string,
    ): ts.TypeNode {
        const element = this.generateTypeReference(nodeId);
        return this.factory.createArrayTypeNode(element);
    }
    protected generateInterfaceTypeDefinition(
        nodeIds: Record<string, string>,
        required: Set<string>,
    ): ts.TypeNode {
        const members = Object.entries(nodeIds).
            map(([name, nodeId]) => this.factory.createPropertySignature(
                undefined,
                this.factory.createIdentifier(name),
                required.has(name) ?
                    undefined :
                    this.factory.createToken(ts.SyntaxKind.QuestionToken),
                this.generateTypeReference(nodeId),
            ));
        return this.factory.createTypeLiteralNode(members);
    }
    protected generateRecordTypeDefinition(
        nodeId: string,
    ): ts.TypeNode {
        const element = this.generateTypeReference(nodeId);
        return this.factory.createTypeReferenceNode(
            this.factory.createIdentifier("Record"),
            [
                this.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                element,
            ],
        );
    }
    protected generateOneOfCompoundDefinition(
        nodeIds: Array<string>,
    ) {
        const types = nodeIds.
            map(nodeId => this.generateTypeReference(nodeId));
        return this.factory.createUnionTypeNode(types);
    }
    protected generateAnyOfCompoundDefinition(
        nodeIds: Array<string>,
    ) {
        const types = nodeIds.
            map(nodeId => this.generateTypeReference(nodeId)).
            map(typeNode => this.factory.createTypeReferenceNode("Partial", [typeNode]));
        return this.factory.createIntersectionTypeNode(types);
    }
    protected generateAllOfCompoundDefinition(
        nodeIds: Array<string>,
    ) {
        const types = nodeIds.
            map(nodeId => this.generateTypeReference(nodeId));
        return this.factory.createIntersectionTypeNode(types);
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
        const typeName = this.getTypeName(nodeId);
        return this.factory.createTypeReferenceNode(
            this.factory.createIdentifier(typeName),
        );
    }

}
