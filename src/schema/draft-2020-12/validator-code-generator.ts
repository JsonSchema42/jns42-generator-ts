import ts from "typescript";
import { SchemaManager } from "../manager.js";
import { SchemaValidatorCodeGeneratorBase } from "../validator-code-generator.js";
import { SchemaIndexer } from "./indexer.js";
import { selectNodeAdditionalPropertiesEntries, selectNodeDynamicRef, selectNodeItemsEntries, selectNodePrefixItemsEntries, selectNodePropertyNamesEntries, selectNodeRef, selectNodeTypes, selectValidationExclusiveMaximum, selectValidationExclusiveMinimum, selectValidationMaximum, selectValidationMaxItems, selectValidationMaxLength, selectValidationMaxProperties, selectValidationMinimum, selectValidationMinItems, selectValidationMinLength, selectValidationMinProperties, selectValidationMultipleOf, selectValidationPattern, selectValidationRequired, selectValidationUniqueItems } from "./selectors.js";

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

        yield* this.generateCommonValidationStatements(factory, nodeId);

        const types = selectNodeTypes(nodeItem.node);
        if (types != null) {
            let statement: ts.Statement = factory.createBlock([
                factory.createExpressionStatement(factory.createYieldExpression(
                    undefined,
                    factory.createObjectLiteralExpression([
                        factory.createShorthandPropertyAssignment(factory.createIdentifier("path")),
                        factory.createPropertyAssignment(
                            "error",
                            factory.createStringLiteral("type"),
                        ),
                    ]),
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

    private *generateCommonValidationStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ): Iterable<ts.Statement> {
        const nodeItem = this.indexer.getNodeItem(nodeId);

        const nodeRef = selectNodeRef(nodeItem.node);
        if (nodeRef != null) {
            const resolvedNodeId = this.indexer.resolveReferenceNodeId(
                nodeId,
                nodeRef,
            );

            const resolvedTypeName = this.manager.getName(resolvedNodeId);

            yield factory.createExpressionStatement(factory.createYieldExpression(
                factory.createToken(ts.SyntaxKind.AsteriskToken),
                factory.createCallExpression(
                    factory.createIdentifier(`validate${resolvedTypeName}`),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                        factory.createIdentifier("path"),
                    ],
                )),
            );

        }

        const nodeDynamicRef = selectNodeDynamicRef(nodeItem.node);
        if (nodeDynamicRef != null) {
            const resolvedNodeId = this.indexer.resolveDynamicReferenceNodeId(
                nodeId,
                nodeDynamicRef,
            );

            const resolvedTypeName = this.manager.getName(resolvedNodeId);

            yield factory.createExpressionStatement(factory.createYieldExpression(
                factory.createToken(ts.SyntaxKind.AsteriskToken),
                factory.createCallExpression(
                    factory.createIdentifier(`validate${resolvedTypeName}`),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                        factory.createIdentifier("path"),
                    ],
                )),
            );
        }
    }

    protected *generateArrayTypeValidationStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ) {
        const nodeItem = this.indexer.getNodeItem(nodeId);

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
                "min-items",
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
                "max-items",
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
                "unique-items",
            );
        }

        const prefixItemsEntries = selectNodePrefixItemsEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );
        {
            let index = 0;
            for (const [subNodePointer] of prefixItemsEntries) {
                const subNodeUrl = new URL(
                    `#${subNodePointer}`,
                    nodeItem.nodeRootUrl,
                );
                const subNodeId = String(subNodeUrl);

                const typeName = this.manager.getName(subNodeId);

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

        const itemsEntries = selectNodeItemsEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );
        for (const [subNodePointer] of itemsEntries) {
            const subNodeUrl = new URL(
                `#${subNodePointer}`,
                nodeItem.nodeRootUrl,
            );
            const subNodeId = String(subNodeUrl);

            const typeName = this.manager.getName(subNodeId);

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
                "min-properties",
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
                "max-properties",
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
                "required",
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

        const properties = selectNodePropertyNamesEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );

        for (const [subNodePointer, propertyName] of properties) {
            const subNodeUrl = new URL(
                `#${subNodePointer}`,
                nodeItem.nodeRootUrl,
            );
            const subNodeId = String(subNodeUrl);

            const typeName = this.manager.getName(subNodeId);

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
                "min-length",
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
                "max-length",
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
                "pattern",
            );
        }
    }

    protected * generateNumberTypeValidationStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ) {
        const nodeItem = this.indexer.getNodeItem(nodeId);

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
                "minimum",
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
                "exclusive-minimum",
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
                "maximum",
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
                "exclusive-maximum",
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
                "multiple-of",
            );
        }
    }

}

