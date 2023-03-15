import ts from "typescript";
import { SchemaCollection } from "./schema-collection.js";
import { SchemaIndexer, SchemaIndexerNodeItem } from "./schema-indexer.js";
import { SchemaNamer } from "./schema-namer.js";
import { selectNodeType, selectValidationExclusiveMaximum, selectValidationExclusiveMinimum, selectValidationMaximum, selectValidationMaxItems, selectValidationMaxLength, selectValidationMaxProperties, selectValidationMinimum, selectValidationMinItems, selectValidationMinLength, selectValidationMinProperties, selectValidationMultipleOf, selectValidationPattern, selectValidationRequired, selectValidationUniqueItems } from "./selectors/index.js";
import { generateLiteral } from "./utils/index.js";

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
                statement = this.generateTypeValidationIfStatement(type, nodeItem, statement);
            }
            yield statement;
        }

    }

    generateTypeValidationIfStatement(
        type: string,
        nodeItem: SchemaIndexerNodeItem,
        elseStatement: ts.Statement,
    ) {
        const { factory } = this;

        const thenBlock = factory.createBlock(
            [
                ...this.generateTypeValidationStatements(type, nodeItem),
            ].map(
                testExpression => factory.createIfStatement(testExpression, factory.createBlock([
                    this.factory.createThrowStatement(this.factory.createNewExpression(
                        this.factory.createIdentifier("Error"),
                        undefined,
                        [this.factory.createStringLiteral("validation failed")],
                    )),
                ])),
            ),
            true,
        );

        const testExpression = this.generateCallValidatorExpression(
            "validateType",
            type,
        );

        return factory.createIfStatement(
            testExpression,
            thenBlock,
            elseStatement,
        );
    }

    // eslint-disable-next-line complexity
    *generateTypeValidationStatements(
        type: string,
        nodeItem: SchemaIndexerNodeItem,
    ) {
        switch (type) {
            case "null":
                break;

            case "array": {
                const minItems = selectValidationMinItems(nodeItem.node);
                const maxItems = selectValidationMaxItems(nodeItem.node);
                const uniqueItems = selectValidationUniqueItems(nodeItem.node);

                if (minItems != null) {
                    yield this.generateCallValidatorExpression("validateMinItems", minItems);
                }
                if (maxItems != null) {
                    yield this.generateCallValidatorExpression("validateMaxItems", maxItems);
                }
                if (uniqueItems != null) {
                    yield this.generateCallValidatorExpression("validateUniqueItems", uniqueItems);
                }
                break;
            }

            case "object": {
                const minProperties = selectValidationMinProperties(nodeItem.node);
                const maxProperties = selectValidationMaxProperties(nodeItem.node);
                const required = selectValidationRequired(nodeItem.node);

                if (minProperties != null) {
                    yield this.generateCallValidatorExpression("validateMinProperties", minProperties);
                }
                if (maxProperties != null) {
                    yield this.generateCallValidatorExpression("validateMaxProperties", maxProperties);
                }
                if (required != null) {
                    yield this.generateCallValidatorExpression("validateRequired", required);
                }

                break;
            }

            case "string": {
                const minLength = selectValidationMinLength(nodeItem.node);
                const maxLength = selectValidationMaxLength(nodeItem.node);
                const pattern = selectValidationPattern(nodeItem.node);

                if (minLength != null) {
                    yield this.generateCallValidatorExpression("validateMinLength", minLength);
                }
                if (maxLength != null) {
                    yield this.generateCallValidatorExpression("validateMaxLength", maxLength);
                }
                if (pattern != null) {
                    yield this.generateCallValidatorExpression("validatePattern", pattern);
                }

                break;
            }

            case "number": {
                const minimum = selectValidationMinimum(nodeItem.node);
                const exclusiveMinimum = selectValidationExclusiveMinimum(nodeItem.node);
                const maximum = selectValidationMaximum(nodeItem.node);
                const exclusiveMaximum = selectValidationExclusiveMaximum(nodeItem.node);
                const multipleOf = selectValidationMultipleOf(nodeItem.node);

                if (minimum != null) {
                    yield this.generateCallValidatorExpression("validateMinimum", minimum);
                }
                if (exclusiveMinimum != null) {
                    yield this.generateCallValidatorExpression("validateExclusiveMinimum", exclusiveMinimum);
                }
                if (maximum != null) {
                    yield this.generateCallValidatorExpression("validateMaximum", maximum);
                }
                if (exclusiveMaximum != null) {
                    yield this.generateCallValidatorExpression("validateExclusiveMaximum", exclusiveMaximum);
                }
                if (multipleOf != null) {
                    yield this.generateCallValidatorExpression("validateMultipleOf", multipleOf);
                }

                break;
            }

            case "integer": {
                const minimum = selectValidationMinimum(nodeItem.node);
                const exclusiveMinimum = selectValidationExclusiveMinimum(nodeItem.node);
                const maximum = selectValidationMaximum(nodeItem.node);
                const exclusiveMaximum = selectValidationExclusiveMaximum(nodeItem.node);
                const multipleOf = selectValidationMultipleOf(nodeItem.node);

                if (minimum != null) {
                    yield this.generateCallValidatorExpression("validateMinimum", minimum);
                }
                if (exclusiveMinimum != null) {
                    yield this.generateCallValidatorExpression("validateExclusiveMinimum", exclusiveMinimum);
                }
                if (maximum != null) {
                    yield this.generateCallValidatorExpression("validateMaximum", maximum);
                }
                if (exclusiveMaximum != null) {
                    yield this.generateCallValidatorExpression("validateExclusiveMaximum", exclusiveMaximum);
                }
                if (multipleOf != null) {
                    yield this.generateCallValidatorExpression("validateMultipleOf", multipleOf);
                }

                break;
            }

            case "boolean":
                break;

        }
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

    generateCallValidatorExpression(
        validatorName: string,
        validateArgument: unknown,
    ) {

        return this.factory.createCallExpression(
            this.factory.createPropertyAccessExpression(
                this.factory.createIdentifier("validation"),
                validatorName,
            ),
            undefined,
            [
                this.factory.createIdentifier("value"),
                generateLiteral(this.factory, validateArgument),
            ],
        );
    }

}
