import ts from "typescript";
import { SchemaManager } from "../manager.js";
import { SchemaValidatorCodeGeneratorBase } from "../validator-code-generator.js";
import { SchemaIndexer } from "./indexer.js";
import { selectNodeAdditionalPropertiesEntries, selectNodeItemsEntries as selectNodeAdditionalItemsEntries, selectNodeItemsEntries, selectNodeProperties, selectNodeType, selectValidationExclusiveMaximum, selectValidationExclusiveMinimum, selectValidationMaximum, selectValidationMaxItems, selectValidationMaxLength, selectValidationMaxProperties, selectValidationMinimum, selectValidationMinItems, selectValidationMinLength, selectValidationMinProperties, selectValidationMultipleOf, selectValidationPattern, selectValidationRequired, selectValidationUniqueItems } from "./selectors.js";

export class SchemaValidatorCodeGenerator extends SchemaValidatorCodeGeneratorBase {
    constructor(
        manager: SchemaManager,
        private readonly indexer: SchemaIndexer,
    ) {
        super(manager);
    }

    protected *generateValidatorFunctionBodyStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ): Iterable<ts.Statement> {
        const nodeItem = this.indexer.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

        // yield* this.generateCommonValidationStatements(nodeItem);

        const types = selectNodeType(nodeItem.node);
        if (types != null) {
            let statement: ts.Statement = factory.createBlock([
                factory.createExpressionStatement(factory.createYieldExpression(
                    undefined,
                    factory.createIdentifier("path"),
                )),
            ]);
            for (const type of types) {
                statement = this.generateTypeValidationIfStatement(
                    factory,
                    nodeId,
                    type,
                    statement,
                );
            }
            yield statement;
        }

    }

    protected *generateArrayTypeValidationStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ) {
        const nodeItem = this.indexer.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

        const minItems = selectValidationMinItems(nodeItem.node);
        const maxItems = selectValidationMaxItems(nodeItem.node);
        const uniqueItems = selectValidationUniqueItems(nodeItem.node);

        if (minItems != null) {
            yield this.wrapValidationExpression(
                factory,
                this.generateCallValidatorExpression(
                    factory,
                    "isValidMinItems",
                    minItems,
                ),
            );
        }
        if (maxItems != null) {
            yield this.wrapValidationExpression(
                factory,
                this.generateCallValidatorExpression(
                    factory,
                    "isValidMaxItems",
                    maxItems,
                ),
            );
        }
        if (uniqueItems != null) {
            yield this.wrapValidationExpression(
                factory,
                this.generateCallValidatorExpression(
                    factory,
                    "isValidUniqueItems",
                    uniqueItems,
                ),
            );
        }

        const itemsEntries = selectNodeItemsEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );
        {
            let index = 0;
            for (const [subNodePointer] of itemsEntries) {
                const subNodeUrl = new URL(
                    `#${subNodePointer}`,
                    nodeItem.nodeRootUrl,
                );
                const subNodeId = String(subNodeUrl);

                const typeName = this.manager.getName(subNodeId);
                if (typeName == null) {
                    throw new Error("name not found");
                }

                yield factory.createExpressionStatement(factory.createYieldExpression(
                    factory.createToken(ts.SyntaxKind.AsteriskToken),
                    factory.createCallExpression(
                        factory.createIdentifier(`validate${typeName}`),
                        undefined,
                        [
                            factory.createElementAccessExpression(
                                factory.createIdentifier("value"),
                                factory.createNumericLiteral(index),
                            ),
                            factory.createArrayLiteralExpression(
                                [
                                    factory.createSpreadElement(factory.createIdentifier("path")),
                                    factory.createStringLiteral(String(index)),
                                ],
                                false,
                            ),
                        ],
                    )),
                );
                index++;
            }
        }

        const additionalItemsEntries = selectNodeAdditionalItemsEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );
        for (const [subNodePointer] of additionalItemsEntries) {
            const subNodeUrl = new URL(
                `#${subNodePointer}`,
                nodeItem.nodeRootUrl,
            );
            const subNodeId = String(subNodeUrl);

            const typeName = this.manager.getName(subNodeId);
            if (typeName == null) {
                throw new Error("name not found");
            }

            yield factory.createForOfStatement(
                undefined,
                factory.createVariableDeclarationList([
                    factory.createVariableDeclaration(
                        factory.createIdentifier("entry"),
                    ),
                ], ts.NodeFlags.Const),
                factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("Object"),
                        factory.createIdentifier("entries"),
                    ),
                    undefined,
                    [factory.createIdentifier("value")],
                ),
                factory.createBlock([
                    factory.createVariableStatement(
                        undefined,
                        factory.createVariableDeclarationList([
                            factory.createVariableDeclaration(
                                factory.createArrayBindingPattern([
                                    factory.createBindingElement(
                                        undefined,
                                        undefined,
                                        factory.createIdentifier("key"),
                                    ),
                                    factory.createBindingElement(
                                        undefined,
                                        undefined,
                                        factory.createIdentifier("value"),
                                    ),
                                ]),
                                undefined,
                                undefined,
                                factory.createIdentifier("entry"),
                            ),
                        ], ts.NodeFlags.Const),
                    ),
                    factory.createExpressionStatement(factory.createYieldExpression(
                        factory.createToken(ts.SyntaxKind.AsteriskToken),
                        factory.createCallExpression(
                            factory.createIdentifier(`validate${typeName}`),
                            undefined,
                            [
                                factory.createIdentifier("value"),
                                factory.createArrayLiteralExpression(
                                    [
                                        factory.createSpreadElement(factory.createIdentifier("path")),
                                        factory.createIdentifier("key"),
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

    protected *generateObjectTypeValidationStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ) {
        const nodeItem = this.indexer.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

        const minProperties = selectValidationMinProperties(nodeItem.node);
        const maxProperties = selectValidationMaxProperties(nodeItem.node);
        const required = selectValidationRequired(nodeItem.node);

        if (minProperties != null) {
            yield this.wrapValidationExpression(
                factory,
                this.generateCallValidatorExpression(
                    factory,
                    "isValidMinProperties",
                    minProperties,
                ),
            );
        }
        if (maxProperties != null) {
            yield this.wrapValidationExpression(
                factory,
                this.generateCallValidatorExpression(
                    factory,
                    "isValidMaxProperties",
                    maxProperties,
                ),
            );
        }
        if (required != null) {
            yield this.wrapValidationExpression(
                factory,
                this.generateCallValidatorExpression(
                    factory,
                    "isValidRequired",
                    required,
                ),
            );
        }

        const additionalPropertiesEntries = selectNodeAdditionalPropertiesEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );
        for (const [subNodePointer] of additionalPropertiesEntries) {
            const subNodeUrl = new URL(
                `#${subNodePointer}`,
                nodeItem.nodeRootUrl,
            );
            const subNodeId = String(subNodeUrl);

            const typeName = this.manager.getName(subNodeId);
            if (typeName == null) {
                throw new Error("name not found");
            }

            yield factory.createForOfStatement(
                undefined,
                factory.createVariableDeclarationList([
                    factory.createVariableDeclaration(
                        factory.createIdentifier("entry"),
                    ),
                ], ts.NodeFlags.Const),
                factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("Object"),
                        factory.createIdentifier("entries"),
                    ),
                    undefined,
                    [factory.createIdentifier("value")],
                ),
                factory.createBlock([
                    factory.createVariableStatement(
                        undefined,
                        factory.createVariableDeclarationList([
                            factory.createVariableDeclaration(
                                factory.createArrayBindingPattern([
                                    factory.createBindingElement(
                                        undefined,
                                        undefined,
                                        factory.createIdentifier("key"),
                                    ),
                                    factory.createBindingElement(
                                        undefined,
                                        undefined,
                                        factory.createIdentifier("value"),
                                    ),
                                ]),
                                undefined,
                                undefined,
                                factory.createIdentifier("entry"),
                            ),
                        ], ts.NodeFlags.Const),
                    ),
                    factory.createExpressionStatement(factory.createYieldExpression(
                        factory.createToken(ts.SyntaxKind.AsteriskToken),
                        factory.createCallExpression(
                            factory.createIdentifier(`validate${typeName}`),
                            undefined,
                            [
                                factory.createIdentifier("value"),
                                factory.createArrayLiteralExpression(
                                    [
                                        factory.createSpreadElement(factory.createIdentifier("path")),
                                        factory.createIdentifier("key"),
                                    ],
                                    false,
                                ),
                            ],
                        )),
                    ),
                ], true),
            );
        }

        const properties = selectNodeProperties(
            nodeItem.nodePointer,
            nodeItem.node,
        );

        for (const [propertyName, subNodePointer] of properties) {
            const subNodeUrl = new URL(
                `#${subNodePointer}`,
                nodeItem.nodeRootUrl,
            );
            const subNodeId = String(subNodeUrl);

            const typeName = this.manager.getName(subNodeId);
            if (typeName == null) {
                throw new Error("name not found");
            }

            yield factory.createIfStatement(
                factory.createBinaryExpression(
                    factory.createElementAccessExpression(
                        factory.createIdentifier("value"),
                        factory.createStringLiteral(propertyName),
                    ),
                    factory.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                    factory.createIdentifier("undefined"),
                ),
                factory.createBlock([
                    factory.createExpressionStatement(factory.createYieldExpression(
                        factory.createToken(ts.SyntaxKind.AsteriskToken),
                        factory.createCallExpression(
                            factory.createIdentifier(`validate${typeName}`),
                            undefined,
                            [
                                factory.createElementAccessExpression(
                                    factory.createIdentifier("value"),
                                    factory.createStringLiteral(propertyName),
                                ),
                                factory.createArrayLiteralExpression(
                                    [
                                        factory.createSpreadElement(factory.createIdentifier("path")),
                                        factory.createStringLiteral(propertyName),
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

    protected * generateStringTypeValidationStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ) {
        const nodeItem = this.indexer.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

        const minLength = selectValidationMinLength(nodeItem.node);
        const maxLength = selectValidationMaxLength(nodeItem.node);
        const pattern = selectValidationPattern(nodeItem.node);

        if (minLength != null) {
            yield this.wrapValidationExpression(
                factory,
                this.generateCallValidatorExpression(
                    factory,
                    "isValidMinLength",
                    minLength,
                ),
            );
        }
        if (maxLength != null) {
            yield this.wrapValidationExpression(
                factory,
                this.generateCallValidatorExpression(
                    factory,
                    "isValidMaxLength",
                    maxLength,
                ),
            );
        }
        if (pattern != null) {
            yield this.wrapValidationExpression(
                factory,
                this.generateCallValidatorExpression(
                    factory,
                    "isValidPattern",
                    pattern,
                ),
            );
        }
    }

    protected * generateNumberTypeValidationStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ) {
        const nodeItem = this.indexer.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

        const minimum = selectValidationMinimum(nodeItem.node);
        const exclusiveMinimum = selectValidationExclusiveMinimum(nodeItem.node);
        const maximum = selectValidationMaximum(nodeItem.node);
        const exclusiveMaximum = selectValidationExclusiveMaximum(nodeItem.node);
        const multipleOf = selectValidationMultipleOf(nodeItem.node);

        if (minimum != null) {
            yield this.wrapValidationExpression(
                factory,
                this.generateCallValidatorExpression(
                    factory,
                    "isValidMinimum",
                    minimum,
                ),
            );
        }
        if (exclusiveMinimum != null) {
            yield this.wrapValidationExpression(
                factory,
                this.generateCallValidatorExpression(
                    factory,
                    "isValidExclusiveMinimum",
                    exclusiveMinimum,
                ),
            );
        }
        if (maximum != null) {
            yield this.wrapValidationExpression(
                factory,
                this.generateCallValidatorExpression(
                    factory,
                    "isValidMaximum",
                    maximum,
                ),
            );
        }
        if (exclusiveMaximum != null) {
            yield this.wrapValidationExpression(
                factory,
                this.generateCallValidatorExpression(
                    factory,
                    "isValidExclusiveMaximum",
                    exclusiveMaximum,
                ),
            );
        }
        if (multipleOf != null) {
            yield this.wrapValidationExpression(
                factory,
                this.generateCallValidatorExpression(
                    factory,
                    "isValidMultipleOf",
                    multipleOf,
                ),
            );
        }
    }

}

