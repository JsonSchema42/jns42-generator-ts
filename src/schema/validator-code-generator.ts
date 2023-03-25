import ts from "typescript";
import { SchemaCodeGeneratorBase } from "./code-generator.js";

export abstract class SchemaValidatorCodeGeneratorBase extends SchemaCodeGeneratorBase {

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

