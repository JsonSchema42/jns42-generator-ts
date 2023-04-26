import ts from "typescript";
import { CodeGeneratorBase } from "./code-generator-base.js";

export interface NullTypeDescriptor {
    type: "null"
}

export interface BooleanTypeDescriptor {
    type: "boolean"
    options?: boolean[]
}

export interface NumberTypeDescriptor {
    type: "number"
    numberType: "integer" | "float"
    options?: number[]
    minimumInclusive?: number
    minimumExclusive?: number
    maximumInclusive?: number
    maximumExclusive?: number
    multipleOf?: number
}

export interface StringTypeDescriptor {
    type: "string"
    options?: string[]
    minimumLength?: number
    maximumLength?: number
    valuePattern?: RegExp
}

export interface InterfaceTypeDescriptor {
    type: "interface"
    requiredProperties: string[]
}

export interface RecordTypeDescriptor {
    type: "record"
    requiredProperties: string[]
    minimumProperties?: number
    maximumProperties?: number
    propertyNamePattern?: RegExp
    propertyTypeNodeId: string | boolean
}

export interface TupleTypeDescriptor {
    type: "tuple"
    uniqueItems?: boolean
    propertyTypeNodeId: string | boolean
}

export interface ArrayTypeDescriptor {
    type: "array"
    minimumItems?: number
    maximumItems?: number
    uniqueItems?: boolean
    itemTypeNodeId: string | boolean
}

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

    protected generateNullTypeDefinition(
        nodeId: string,
    ): ts.TypeNode {
        return this.factory.createLiteralTypeNode(
            this.factory.createNull(),
        );
    }
    protected generateArrayTypeDefinition(
        nodeId: string,
    ): ts.TypeNode {
        throw new Error("todo");
    }
    protected generateObjectTypeDefinition(
        nodeId: string,
    ): ts.TypeNode {
        throw new Error("todo");
    }
    protected generateStringTypeDefinition(
        nodeId: string,
    ): ts.TypeNode {
        return this.factory.createKeywordTypeNode(
            ts.SyntaxKind.StringKeyword,
        );
    }
    protected generateNumberTypeDefinition(
        nodeId: string,
    ): ts.TypeNode {
        return this.factory.createKeywordTypeNode(
            ts.SyntaxKind.NumberKeyword,
        );
    }
    protected generateIntegerTypeDefinition(
        nodeId: string,
    ): ts.TypeNode {
        return this.generateNumberTypeDefinition(
            nodeId,
        );
    }
    protected generateBooleanTypeDefinition(
        nodeId: string,
    ): ts.TypeNode {
        return this.factory.createKeywordTypeNode(
            ts.SyntaxKind.BooleanKeyword,
        );
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

    protected generateTypeNodes(
        nodeId: string,
    ): Iterable<ts.TypeNode> {
        const type = "" as string;
        switch (type) {
            case "null":
                break;

            case "boolean":
                break;

            case "number":
                break;

            case "string":
                break;

            case "interface":
                break;

            case "record":
                break;

            case "tuple":
                break;

            case "array":
                break;

        }

        throw new Error("todo");
    }

    protected generateComposedTypeNode(
        nodeId: string,
    ): ts.TypeNode {
        const typeNodes = [...this.generateTypeNodes(nodeId)];
        const node = typeNodes.length === 0 ?
            this.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword) :
            this.factory.createParenthesizedType(this.factory.createIntersectionTypeNode(
                typeNodes,
            ));
        return node;
    }

    protected generateTypeDefinition(
        nodeId: string,
        type: string,
    ): ts.TypeNode {
        switch (type) {
            case "null":
                return this.generateNullTypeDefinition(
                    nodeId,
                );

            case "array":
                return this.generateArrayTypeDefinition(
                    nodeId,
                );

            case "object":
                return this.generateObjectTypeDefinition(
                    nodeId,
                );

            case "string":
                return this.generateStringTypeDefinition(
                    nodeId,
                );

            case "number":
                return this.generateNumberTypeDefinition(
                    nodeId,
                );

            case "integer":
                return this.generateIntegerTypeDefinition(
                    nodeId,
                );

            case "boolean":
                return this.generateBooleanTypeDefinition(
                    nodeId,
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
            this.factory.createIdentifier(typeName),
        );
    }

}
