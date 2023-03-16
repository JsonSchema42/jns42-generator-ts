import ts from "typescript";
import { SchemaCollection } from "./schema-collection.js";
import { SchemaIndexer, SchemaIndexerNodeItem } from "./schema-indexer.js";
import { SchemaNamer } from "./schema-namer.js";
import { selectNodeAdditionalPropertiesUrl, selectNodeAllOfEntries, selectNodeAnyOfEntries, selectNodeDynamicRefUrl, selectNodeItemsUrl, selectNodeOneOfEntries, selectNodePrefixItemsUrls, selectNodeProperties, selectNodeRefUrl, selectNodeType, selectValidationConst, selectValidationEnum, selectValidationExclusiveMaximum, selectValidationExclusiveMinimum, selectValidationMaximum, selectValidationMaxItems, selectValidationMaxLength, selectValidationMaxProperties, selectValidationMinimum, selectValidationMinItems, selectValidationMinLength, selectValidationMinProperties, selectValidationMultipleOf, selectValidationPattern, selectValidationRequired, selectValidationUniqueItems } from "./selectors/index.js";
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
            yield this.generateFunctionDeclaration(
                nodeItem,
            );
        }
    }

    generateFunctionDeclaration(nodeItem: SchemaIndexerNodeItem): ts.FunctionDeclaration {
        const typeName = this.schemaNamer.getName(nodeItem.nodeUrl);

        if (typeName == null) {
            throw new Error("typeName not found");
        }

        return this.factory.createFunctionDeclaration(
            [
                this.factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            this.factory.createToken(ts.SyntaxKind.AsteriskToken),
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

        yield* this.generateCommonValidationStatements(nodeItem);

        const types = selectNodeType(nodeItem.node);
        if (types != null) {
            let statement: ts.Statement = this.factory.createBlock([
                this.factory.createExpressionStatement(this.factory.createYieldExpression(
                    undefined,
                    this.factory.createIdentifier("path"),
                )),
            ]);
            for (const type of types) {
                statement = this.generateTypeValidationIfStatement(type, nodeItem, statement);
            }
            yield statement;
        }

    }

    wrapValidationExpression(testExpression: ts.Expression) {
        return this.factory.createIfStatement(
            testExpression,
            this.factory.createBlock([
                this.factory.createExpressionStatement(this.factory.createYieldExpression(
                    undefined,
                    this.factory.createIdentifier("path"),
                )),
            ]),
        );
    }

    generateTypeValidationIfStatement(
        type: string,
        nodeItem: SchemaIndexerNodeItem,
        elseStatement: ts.Statement,
    ) {
        const thenBlock = this.factory.createBlock(
            [
                ...this.generateTypeValidationStatements(type, nodeItem),
            ],
            true,
        );

        const testExpression = this.generateCallValidatorExpression(
            "isValidType",
            type,
        );

        return this.factory.createIfStatement(
            testExpression,
            thenBlock,
            elseStatement,
        );
    }

    *generateCommonValidationStatements(
        nodeItem: SchemaIndexerNodeItem,
    ) {
        const constValue = selectValidationConst(nodeItem.node);
        const enumValues = selectValidationEnum(nodeItem.node);

        if (constValue != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidConst", constValue),
            );
        }
        if (enumValues != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidEnum", enumValues),
            );
        }

        const nodeRefUrl = selectNodeRefUrl(nodeItem.nodeUrl, nodeItem.node);
        if (nodeRefUrl != null) {
            const resolvedUrl = this.resolveReference(nodeRefUrl);
            const name = this.schemaNamer.getName(resolvedUrl);
            if (name == null) {
                throw new Error("name not found");
            }
            yield this.factory.createExpressionStatement(this.factory.createYieldExpression(
                this.factory.createToken(ts.SyntaxKind.AsteriskToken),
                this.factory.createCallExpression(
                    this.factory.createIdentifier(`validate${name}`),
                    undefined,
                    [
                        this.factory.createIdentifier("value"),
                        this.factory.createIdentifier("path"),
                    ],
                ),
            ));
        }

        const nodeDynamicRefUrl = selectNodeDynamicRefUrl(nodeItem.nodeUrl, nodeItem.node);
        if (nodeDynamicRefUrl != null) {
            const resolvedUrl = this.resolveDynamicReference(nodeDynamicRefUrl);
            const name = this.schemaNamer.getName(resolvedUrl);
            if (name == null) {
                throw new Error("name not found");
            }
            yield this.factory.createExpressionStatement(this.factory.createYieldExpression(
                this.factory.createToken(ts.SyntaxKind.AsteriskToken),
                this.factory.createCallExpression(
                    this.factory.createIdentifier(`validate${name}`),
                    undefined,
                    [
                        this.factory.createIdentifier("value"),
                        this.factory.createIdentifier("path"),
                    ],
                )),
            );
        }

        const anyOfEntries = [...selectNodeAnyOfEntries(nodeItem.nodeUrl, nodeItem.node)];
        if (anyOfEntries.length > 0) {
            yield this.factory.createExpressionStatement(this.factory.createYieldExpression(
                this.factory.createToken(ts.SyntaxKind.AsteriskToken),
                this.factory.createCallExpression(
                    this.factory.createPropertyAccessExpression(
                        this.factory.createIdentifier("validation"),
                        this.factory.createIdentifier("validateAnyOf"),
                    ),
                    undefined,
                    [
                        this.factory.createIdentifier("value"),
                        this.factory.createArrayLiteralExpression(
                            anyOfEntries.map(entry => {
                                const [url] = entry;
                                const name = this.schemaNamer.getName(url);

                                if (name == null) {
                                    throw new Error("name not found");
                                }
                                return this.factory.createIdentifier(`validate${name}`);
                            }),
                            true,
                        ),
                        this.factory.createIdentifier("path"),
                    ],
                )),
            );
        }

        const oneOfEntries = [...selectNodeOneOfEntries(nodeItem.nodeUrl, nodeItem.node)];
        if (oneOfEntries.length > 0) {
            yield this.factory.createExpressionStatement(this.factory.createYieldExpression(
                this.factory.createToken(ts.SyntaxKind.AsteriskToken),
                this.factory.createCallExpression(
                    this.factory.createPropertyAccessExpression(
                        this.factory.createIdentifier("validation"),
                        this.factory.createIdentifier("validateOneOf"),
                    ),
                    undefined,
                    [
                        this.factory.createIdentifier("value"),
                        this.factory.createArrayLiteralExpression(
                            oneOfEntries.map(entry => {
                                const [url] = entry;
                                const name = this.schemaNamer.getName(url);

                                if (name == null) {
                                    throw new Error("name not found");
                                }
                                return this.factory.createIdentifier(`validate${name}`);
                            }),
                            true,
                        ),
                        this.factory.createIdentifier("path"),
                    ],
                )),
            );
        }

        const allOfEntries = [...selectNodeAllOfEntries(nodeItem.nodeUrl, nodeItem.node)];
        if (allOfEntries.length > 0) {
            yield this.factory.createExpressionStatement(this.factory.createYieldExpression(
                this.factory.createToken(ts.SyntaxKind.AsteriskToken),
                this.factory.createCallExpression(
                    this.factory.createPropertyAccessExpression(
                        this.factory.createIdentifier("validation"),
                        this.factory.createIdentifier("validateAllOf"),
                    ),
                    undefined,
                    [
                        this.factory.createIdentifier("value"),
                        this.factory.createArrayLiteralExpression(
                            allOfEntries.map(entry => {
                                const [url] = entry;
                                const name = this.schemaNamer.getName(url);

                                if (name == null) {
                                    throw new Error("name not found");
                                }
                                return this.factory.createIdentifier(`validate${name}`);
                            }),
                            true,
                        ),
                        this.factory.createIdentifier("path"),
                    ],
                )),
            );
        }
    }

    *generateTypeValidationStatements(
        type: string,
        nodeItem: SchemaIndexerNodeItem,
    ) {
        switch (type) {
            case "null":
                break;

            case "array":
                yield* this.generateArrayTypeValidationStatements(nodeItem);
                break;

            case "object":
                yield* this.generateObjectTypeValidationStatements(nodeItem);
                break;

            case "string":
                yield* this.generateStringTypeValidationStatements(nodeItem);
                break;

            case "number":
                yield* this.generateNumberTypeValidationStatements(nodeItem);
                break;

            case "integer":
                yield* this.generateIntegerTypeValidationStatements(nodeItem);
                break;

            case "boolean":
                break;

            default:
                throw new Error("type not supported");
        }
    }

    *generateArrayTypeValidationStatements(
        nodeItem: SchemaIndexerNodeItem,
    ) {
        const minItems = selectValidationMinItems(nodeItem.node);
        const maxItems = selectValidationMaxItems(nodeItem.node);
        const uniqueItems = selectValidationUniqueItems(nodeItem.node);

        if (minItems != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidMinItems", minItems),
            );
        }
        if (maxItems != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidMaxItems", maxItems),
            );
        }
        if (uniqueItems != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidUniqueItems", uniqueItems),
            );
        }

        const prefixItemsUrls = selectNodePrefixItemsUrls(nodeItem.nodeUrl, nodeItem.node);
        if (prefixItemsUrls != null) {
            for (const [key, prefixItemsUrl] of Object.entries(prefixItemsUrls)) {
                const prefixItemName = this.schemaNamer.getName(prefixItemsUrl);
                if (prefixItemName == null) {
                    throw new Error("name not found");
                }

                yield this.factory.createExpressionStatement(this.factory.createYieldExpression(
                    this.factory.createToken(ts.SyntaxKind.AsteriskToken),
                    this.factory.createCallExpression(
                        this.factory.createIdentifier(`validate${prefixItemName}`),
                        undefined,
                        [
                            this.factory.createElementAccessExpression(
                                this.factory.createIdentifier("value"),
                                this.factory.createNumericLiteral(key),
                            ),
                            this.factory.createArrayLiteralExpression(
                                [
                                    this.factory.createSpreadElement(this.factory.createIdentifier("path")),
                                    this.factory.createStringLiteral(key),
                                ],
                                false,
                            ),
                        ],
                    )),
                );
            }
        }

        const itemsUrl = selectNodeItemsUrl(nodeItem.nodeUrl, nodeItem.node);
        if (itemsUrl != null) {
            const itemsName = this.schemaNamer.getName(itemsUrl);
            if (itemsName == null) {
                throw new Error("name not found");
            }

            yield this.factory.createForOfStatement(
                undefined,
                this.factory.createVariableDeclarationList([
                    this.factory.createVariableDeclaration(
                        this.factory.createIdentifier("entry"),
                    ),
                ], ts.NodeFlags.Const),
                this.factory.createCallExpression(
                    this.factory.createPropertyAccessExpression(
                        this.factory.createIdentifier("Object"),
                        this.factory.createIdentifier("entries"),
                    ),
                    undefined,
                    [this.factory.createIdentifier("value")],
                ),
                this.factory.createBlock([
                    this.factory.createVariableStatement(
                        undefined,
                        this.factory.createVariableDeclarationList([
                            this.factory.createVariableDeclaration(
                                this.factory.createArrayBindingPattern([
                                    this.factory.createBindingElement(
                                        undefined,
                                        undefined,
                                        this.factory.createIdentifier("key"),
                                    ),
                                    this.factory.createBindingElement(
                                        undefined,
                                        undefined,
                                        this.factory.createIdentifier("value"),
                                    ),
                                ]),
                                undefined,
                                undefined,
                                this.factory.createIdentifier("entry"),
                            ),
                        ], ts.NodeFlags.Const),
                    ),
                    this.factory.createExpressionStatement(this.factory.createYieldExpression(
                        this.factory.createToken(ts.SyntaxKind.AsteriskToken),
                        this.factory.createCallExpression(
                            this.factory.createIdentifier(`validate${itemsName}`),
                            undefined,
                            [
                                this.factory.createIdentifier("value"),
                                this.factory.createArrayLiteralExpression(
                                    [
                                        this.factory.createSpreadElement(this.factory.createIdentifier("path")),
                                        this.factory.createIdentifier("key"),
                                    ],
                                    false,
                                ),
                            ],
                        )),
                    ),
                ], true),
            );
        }

    }

    *generateObjectTypeValidationStatements(
        nodeItem: SchemaIndexerNodeItem,
    ) {
        const minProperties = selectValidationMinProperties(nodeItem.node);
        const maxProperties = selectValidationMaxProperties(nodeItem.node);
        const required = selectValidationRequired(nodeItem.node);

        if (minProperties != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidMinProperties", minProperties),
            );
        }
        if (maxProperties != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidMaxProperties", maxProperties),
            );
        }
        if (required != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidRequired", required),
            );
        }

        const additionalPropertiesUrl = selectNodeAdditionalPropertiesUrl(
            nodeItem.nodeUrl,
            nodeItem.node,
        );
        if (additionalPropertiesUrl != null) {
            const additionalPropertiesName = this.schemaNamer.getName(additionalPropertiesUrl);
            if (additionalPropertiesName == null) {
                throw new Error("name not found");
            }

            yield this.factory.createForOfStatement(
                undefined,
                this.factory.createVariableDeclarationList([
                    this.factory.createVariableDeclaration(
                        this.factory.createIdentifier("entry"),
                    ),
                ], ts.NodeFlags.Const),
                this.factory.createCallExpression(
                    this.factory.createPropertyAccessExpression(
                        this.factory.createIdentifier("Object"),
                        this.factory.createIdentifier("entries"),
                    ),
                    undefined,
                    [this.factory.createIdentifier("value")],
                ),
                this.factory.createBlock([
                    this.factory.createVariableStatement(
                        undefined,
                        this.factory.createVariableDeclarationList([
                            this.factory.createVariableDeclaration(
                                this.factory.createArrayBindingPattern([
                                    this.factory.createBindingElement(
                                        undefined,
                                        undefined,
                                        this.factory.createIdentifier("key"),
                                    ),
                                    this.factory.createBindingElement(
                                        undefined,
                                        undefined,
                                        this.factory.createIdentifier("value"),
                                    ),
                                ]),
                                undefined,
                                undefined,
                                this.factory.createIdentifier("entry"),
                            ),
                        ], ts.NodeFlags.Const),
                    ),
                    this.factory.createExpressionStatement(this.factory.createYieldExpression(
                        this.factory.createToken(ts.SyntaxKind.AsteriskToken),
                        this.factory.createCallExpression(
                            this.factory.createIdentifier(`validate${additionalPropertiesName}`),
                            undefined,
                            [
                                this.factory.createIdentifier("value"),
                                this.factory.createArrayLiteralExpression(
                                    [
                                        this.factory.createSpreadElement(this.factory.createIdentifier("path")),
                                        this.factory.createIdentifier("key"),
                                    ],
                                    false,
                                ),
                            ],
                        )),
                    ),
                ], true),
            );
        }

        const propertiesEntries = selectNodeProperties(nodeItem.nodeUrl, nodeItem.node);
        if (propertiesEntries != null) {
            for (const [key, propertyUrl] of propertiesEntries) {
                const propertyName = this.schemaNamer.getName(propertyUrl);
                if (propertyName == null) {
                    throw new Error("name not found");
                }

                yield this.factory.createExpressionStatement(this.factory.createYieldExpression(
                    this.factory.createToken(ts.SyntaxKind.AsteriskToken),
                    this.factory.createCallExpression(
                        this.factory.createIdentifier(`validate${propertyName}`),
                        undefined,
                        [
                            this.factory.createElementAccessExpression(
                                this.factory.createIdentifier("value"),
                                this.factory.createStringLiteral(key),
                            ),
                            this.factory.createArrayLiteralExpression(
                                [
                                    this.factory.createSpreadElement(this.factory.createIdentifier("path")),
                                    this.factory.createStringLiteral(key),
                                ],
                                false,
                            ),
                        ],
                    )),
                );
            }
        }
    }

    *generateStringTypeValidationStatements(
        nodeItem: SchemaIndexerNodeItem,
    ) {
        const minLength = selectValidationMinLength(nodeItem.node);
        const maxLength = selectValidationMaxLength(nodeItem.node);
        const pattern = selectValidationPattern(nodeItem.node);

        if (minLength != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidMinLength", minLength),
            );
        }
        if (maxLength != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidMaxLength", maxLength),
            );
        }
        if (pattern != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidPattern", pattern),
            );
        }
    }

    *generateNumberTypeValidationStatements(
        nodeItem: SchemaIndexerNodeItem,
    ) {
        const minimum = selectValidationMinimum(nodeItem.node);
        const exclusiveMinimum = selectValidationExclusiveMinimum(nodeItem.node);
        const maximum = selectValidationMaximum(nodeItem.node);
        const exclusiveMaximum = selectValidationExclusiveMaximum(nodeItem.node);
        const multipleOf = selectValidationMultipleOf(nodeItem.node);

        if (minimum != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidMinimum", minimum),
            );
        }
        if (exclusiveMinimum != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidExclusiveMinimum", exclusiveMinimum),
            );
        }
        if (maximum != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidMaximum", maximum),
            );
        }
        if (exclusiveMaximum != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidExclusiveMaximum", exclusiveMaximum),
            );
        }
        if (multipleOf != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidMultipleOf", multipleOf),
            );
        }
    }

    *generateIntegerTypeValidationStatements(
        nodeItem: SchemaIndexerNodeItem,
    ) {
        const minimum = selectValidationMinimum(nodeItem.node);
        const exclusiveMinimum = selectValidationExclusiveMinimum(nodeItem.node);
        const maximum = selectValidationMaximum(nodeItem.node);
        const exclusiveMaximum = selectValidationExclusiveMaximum(nodeItem.node);
        const multipleOf = selectValidationMultipleOf(nodeItem.node);

        if (minimum != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidMinimum", minimum),
            );
        }
        if (exclusiveMinimum != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidExclusiveMinimum", exclusiveMinimum),
            );
        }
        if (maximum != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidMaximum", maximum),
            );
        }
        if (exclusiveMaximum != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidExclusiveMaximum", exclusiveMaximum),
            );
        }
        if (multipleOf != null) {
            yield this.wrapValidationExpression(
                this.generateCallValidatorExpression("isValidMultipleOf", multipleOf),
            );
        }
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

    generateTypeReference(
        nodeUrl: URL,
    ): ts.TypeNode {
        const typeName = this.schemaNamer.getName(nodeUrl);
        if (typeName == null) {
            throw new Error("typeName not found");
        }
        return this.factory.createTypeReferenceNode(typeName);
    }

    resolveReference(
        nodeUrl: URL,
    ) {
        let resolvedUrl = this.schemaIndexer.getAnchorUrl(nodeUrl);

        if (resolvedUrl == null) {
            resolvedUrl = nodeUrl;
        }

        return resolvedUrl;
    }

    resolveDynamicReference(
        nodeUrl: URL,
    ) {
        let instanceUrl: URL | null = this.schemaIndexer.getInstanceUrl(nodeUrl) ?? null;
        let resolvedUrl = nodeUrl;

        while (instanceUrl != null) {
            const instanceItem = this.schemaCollection.getInstanceItem(instanceUrl);
            if (!instanceItem) {
                throw new Error("instanceItem not found");
            }

            const instanceRootUrl = this.schemaIndexer.getInstanceRootUrl(instanceUrl);
            const maybeResolvedUrl = this.schemaIndexer.getDynamicAnchorUrl(
                new URL(nodeUrl.hash, instanceRootUrl),
            );
            if (maybeResolvedUrl != null) {
                resolvedUrl = maybeResolvedUrl;
            }
            instanceUrl = instanceItem.referencingInstanceUrl;
        }

        return resolvedUrl;
    }

}
