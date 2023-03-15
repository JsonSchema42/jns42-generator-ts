import ts from "typescript";
import { SchemaCollection } from "./schema-collection.js";
import { SchemaIndexer, SchemaIndexerNodeItem } from "./schema-indexer.js";
import { SchemaNamer } from "./schema-namer.js";
import { selectNodeType } from "./selectors/index.js";

export class SchemaValidationGenerator {
    constructor(
        private readonly factory: ts.NodeFactory,
        private readonly schemaCollection: SchemaCollection,
        private readonly schemaIndexer: SchemaIndexer,
        private readonly schemaNamer: SchemaNamer,
    ) {

    }

    *generateFunctionDeclarations(): Iterable<ts.FunctionDeclaration> {
        for (const nodeItem of this.schemaIndexer.getNodeItems()) {
            yield this.generatFunctionDeclaration(
                nodeItem,
            );
        }
    }

    generatFunctionDeclaration(nodeItem: SchemaIndexerNodeItem): ts.FunctionDeclaration {
        const typeName = this.schemaNamer.getName(nodeItem.nodeUrl);

        if (typeName == null) {
            throw new Error("typeName not found");
        }

        return this.factory.createFunctionDeclaration(
            undefined,
            undefined,
            `validate${typeName}`,
            undefined,
            [
                this.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    "value",
                    undefined,
                    this.generateTypeReference(nodeItem.nodeUrl),
                ),
                this.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    "path",
                    undefined,
                    this.factory.createArrayTypeNode(
                        this.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    ),
                    this.factory.createArrayLiteralExpression([]),
                ),
            ],
            undefined,
            this.factory.createBlock([...this.generateFunctionStatements(nodeItem)], true),
        );
    }

    *generateFunctionStatements(nodeItem: SchemaIndexerNodeItem): Iterable<ts.Statement> {
        const types = selectNodeType(nodeItem.node);
        if (types != null) {
            let statement: ts.Statement = this.factory.createBlock([
                this.factory.createThrowStatement(this.factory.createNewExpression(
                    this.factory.createIdentifier("Error"),
                    undefined,
                    [this.factory.createStringLiteral("invalid type")],
                )),
            ]);
            for (const type of types) {
                statement = this.generateTypeValidationStatement(type, nodeItem, statement);
            }
            yield statement;
        }

    }

    generateTypeValidationStatement(
        type: string,
        nodeItem: SchemaIndexerNodeItem,
        elseStatement: ts.Statement,
    ) {
        const { factory } = this;

        const thenBlock = factory.createBlock([
        ], true);

        const testExpression = factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createIdentifier("validation"),
                factory.createIdentifier("validateType"),
            ),
            undefined,
            [
                factory.createIdentifier("value"),
                factory.createStringLiteral(type),
            ],
        );

        return factory.createIfStatement(
            testExpression,
            thenBlock,
            elseStatement,
        );
    }

    generateTypeReference(
        nodeUrl: URL,
    ): ts.TypeNode {
        const typeName = this.schemaNamer.getName(nodeUrl);
        if (typeName == null) {
            throw new Error("typeName not found");
        }
        return this.factory.createTypeReferenceNode(typeName);
    }

}
