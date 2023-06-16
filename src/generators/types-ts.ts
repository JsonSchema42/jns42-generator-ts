import ts from "typescript";
import { CompoundUnion, Node, TypeUnion } from "../schema/intermediate.js";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class TypesTsCodeGenerator extends CodeGeneratorBase {
    public *getStatements() {
        for (const node of this.context.selectNodes()) {
            yield this.generateTypeDeclarationStatement(node);
        }
    }

    protected generateTypeDeclarationStatement(node: Node) {
        const typeDefinition = this.generateTypeDefinition(node);

        const typeName = this.getTypeName(node.nodeId);
        const declaration = this.factory.createTypeAliasDeclaration(
            [this.factory.createToken(ts.SyntaxKind.ExportKeyword)],
            typeName,
            undefined,
            typeDefinition
        );

        const comments = [node.description, node.deprecated ? "@deprecated" : ""]
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line) => line + "\n")
            .join("");

        if (comments.length > 0) {
            ts.addSyntheticLeadingComment(
                declaration,
                ts.SyntaxKind.MultiLineCommentTrivia,
                "*\n" + comments,
                true
            );
        }

        return declaration;
    }

    protected generateTypeDefinition(node: Node): ts.TypeNode {
        const { factory: f } = this;

        const typeNodes = [...this.generateTypeDefinitionElements(node.nodeId)];
        const compoundNodes = [...this.generateCompoundDefinitionElements(node.nodeId)];

        let typeDefinitionNode: ts.TypeNode | undefined;
        if (compoundNodes.length > 0) {
            const typeNode = f.createParenthesizedType(f.createIntersectionTypeNode(compoundNodes));
            typeDefinitionNode =
                typeDefinitionNode == null
                    ? typeNode
                    : f.createParenthesizedType(
                          f.createIntersectionTypeNode([typeDefinitionNode, typeNode])
                      );
        }
        if (typeNodes.length > 0) {
            const typeNode = f.createParenthesizedType(f.createUnionTypeNode(typeNodes));
            typeDefinitionNode =
                typeDefinitionNode == null
                    ? typeNode
                    : f.createParenthesizedType(
                          f.createIntersectionTypeNode([typeDefinitionNode, typeNode])
                      );
        }
        if (node.superNodeId != null) {
            const typeNode = this.generateTypeReference(node.superNodeId);
            typeDefinitionNode =
                typeDefinitionNode == null
                    ? typeNode
                    : f.createParenthesizedType(
                          f.createIntersectionTypeNode([typeDefinitionNode, typeNode])
                      );
        }

        if (typeDefinitionNode == null) {
            typeDefinitionNode = f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
        }

        return typeDefinitionNode;
    }

    protected *generateCompoundDefinitionElements(nodeId: string): Iterable<ts.TypeNode> {
        for (const compound of this.context.selectNodeCompounds(nodeId)) {
            yield this.generateCompoundDefinitionElement(compound);
        }
    }

    protected *generateTypeDefinitionElements(nodeId: string): Iterable<ts.TypeNode> {
        for (const type of this.context.selectNodeTypes(nodeId)) {
            yield this.generateTypeDefinitionElement(type);
        }
    }

    protected generateTypeDefinitionElement(type: TypeUnion): ts.TypeNode {
        switch (type.type) {
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
                return this.generateTupleTypeDefinition(type.itemTypeNodeIds);

            case "array":
                return this.generateArrayTypeDefinition(type.itemTypeNodeId);

            case "interface":
                return this.generateInterfaceTypeDefinition(
                    type.propertyTypeNodeIds,
                    new Set(type.requiredProperties)
                );

            case "record":
                return this.generateRecordTypeDefinition(type.propertyTypeNodeId);

            default:
                throw new Error("type not supported");
        }
    }

    protected generateCompoundDefinitionElement(compound: CompoundUnion): ts.TypeNode {
        switch (compound.type) {
            case "one-of":
                return this.generateOneOfCompoundDefinition(compound.typeNodeIds);

            case "any-of":
                return this.generateAnyOfCompoundDefinition(compound.typeNodeIds);

            case "all-of":
                return this.generateAllOfCompoundDefinition(compound.typeNodeIds);

            default:
                throw new Error("type not supported");
        }
    }

    protected generateNeverTypeDefinition(): ts.TypeNode {
        return this.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);
    }
    protected generateAnyTypeDefinition(): ts.TypeNode {
        return this.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    }
    protected generateNullTypeDefinition(): ts.TypeNode {
        return this.factory.createLiteralTypeNode(this.factory.createNull());
    }
    protected generateBooleanTypeDefinition(): ts.TypeNode {
        return this.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
    }
    protected generateNumberTypeDefinition(): ts.TypeNode {
        return this.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    }
    protected generateStringTypeDefinition(): ts.TypeNode {
        return this.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    }
    protected generateTupleTypeDefinition(nodeIds: Array<string>): ts.TypeNode {
        const elements = nodeIds.map((nodeId) => this.generateTypeReference(nodeId));
        return this.factory.createTupleTypeNode(elements);
    }
    protected generateArrayTypeDefinition(nodeId: string): ts.TypeNode {
        const element = this.generateTypeReference(nodeId);
        return this.factory.createArrayTypeNode(element);
    }
    protected generateInterfaceTypeDefinition(
        nodeIds: Record<string, string>,
        required: Set<string>
    ): ts.TypeNode {
        const members = Object.entries(nodeIds).map(([name, nodeId]) =>
            this.factory.createPropertySignature(
                undefined,
                this.factory.createIdentifier(name),
                required.has(name)
                    ? undefined
                    : this.factory.createToken(ts.SyntaxKind.QuestionToken),
                this.generateTypeReference(nodeId)
            )
        );
        return this.factory.createTypeLiteralNode(members);
    }
    protected generateRecordTypeDefinition(nodeId: string): ts.TypeNode {
        const element = this.generateTypeReference(nodeId);
        return this.factory.createTypeReferenceNode(this.factory.createIdentifier("Record"), [
            this.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            element,
        ]);
    }
    protected generateOneOfCompoundDefinition(nodeIds: Array<string>) {
        const types = nodeIds.map((nodeId) => this.generateTypeReference(nodeId));
        return this.factory.createUnionTypeNode(types);
    }
    protected generateAnyOfCompoundDefinition(nodeIds: Array<string>) {
        const types = nodeIds
            .map((nodeId) => this.generateTypeReference(nodeId))
            .map((typeNode) => this.factory.createTypeReferenceNode("Partial", [typeNode]));
        return this.factory.createIntersectionTypeNode(types);
    }
    protected generateAllOfCompoundDefinition(nodeIds: Array<string>) {
        const types = nodeIds.map((nodeId) => this.generateTypeReference(nodeId));
        return this.factory.createIntersectionTypeNode(types);
    }

    protected getTypeName(nodeId: string) {
        const typeName = this.namer.getName(nodeId).join("_");
        return typeName;
    }

    protected generateTypeReference(nodeId: string) {
        const typeName = this.getTypeName(nodeId);
        return this.factory.createTypeReferenceNode(this.factory.createIdentifier(typeName));
    }
}
