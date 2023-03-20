import ts from "typescript";
import { SchemaManager } from "../manager.js";
import { SchemaValidatorGeneratorBase } from "../validator-generator.js";
import { SchemaIndexer, SchemaIndexerNodeItem } from "./indexer.js";
import { SchemaLoader } from "./loader.js";
import { selectNodeType } from "./selectors.js";

export class SchemaValidatorGenerator extends SchemaValidatorGeneratorBase {
    constructor(
        manager: SchemaManager,
        private readonly loader: SchemaLoader,
        private readonly indexer: SchemaIndexer,
    ) {
        super(manager);
    }

    public generateFunctionDeclarationStatement(
        factory: ts.NodeFactory,
        nodeId: string,
    ): ts.FunctionDeclaration {
        const typeName = this.manager.getName(nodeId);
        if (typeName == null) {
            throw new Error("typeName not found");
        }

        const nodeItem = this.indexer.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

        return factory.createFunctionDeclaration(
            [
                factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            factory.createToken(ts.SyntaxKind.AsteriskToken),
            `validate${typeName}`,
            undefined,
            [
                factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    "value",
                    undefined,
                    this.generateTypeReference(factory, nodeId),
                ),
                factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    "path",
                    undefined,
                    factory.createArrayTypeNode(
                        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    ),
                    factory.createArrayLiteralExpression([]),
                ),
            ],
            undefined,
            factory.createBlock([...this.generateFunctionStatements(factory, nodeItem)], true),
        );
    }

    *generateFunctionStatements(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ): Iterable<ts.Statement> {

        // yield* this.generateCommonValidationStatements(nodeItem);

        const types = selectNodeType(nodeItem.node);
        if (types != null) {
            const statement: ts.Statement = factory.createBlock([
                factory.createExpressionStatement(factory.createYieldExpression(
                    undefined,
                    factory.createIdentifier("path"),
                )),
            ]);
            for (const type of types) {
                // statement = this.generateTypeValidationIfStatement(type, nodeItem, statement);
            }
            yield statement;
        }

    }

    private generateTypeReference(
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
