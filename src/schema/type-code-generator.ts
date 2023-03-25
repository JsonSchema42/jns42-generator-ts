import ts from "typescript";
import { SchemaCodeGeneratorBase } from "./code-generator.js";

export abstract class SchemaTypeCodeGeneratorBase extends SchemaCodeGeneratorBase {

    protected abstract generateSchemaTypeDeclarationStatement(
        factory: ts.NodeFactory,
        nodeId: string,
        typeName: string,
    ): ts.Statement;

    public *generateStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ) {
        const typeName = this.manager.getName(nodeId);
        if (typeName == null) {
            throw new Error("typeName not found");
        }

        yield this.generateSchemaTypeDeclarationStatement(
            factory,
            nodeId,
            typeName,
        );

    }

    protected generateTypeReference(
        factory: ts.NodeFactory,
        nodeId: string,
    ): ts.TypeNode {
        const typeName = this.manager.getName(nodeId);
        if (typeName == null) {
            throw new Error("typeName not found");
        }
        return factory.createTypeReferenceNode(typeName);
    }

}

