import ts from "typescript";
import { Namer } from "../../utils/index.js";
import { SchemaManager } from "../manager.js";
import { SchemaValidatorCodeGeneratorBase } from "../validator-code-generator.js";
import { SchemaLoader } from "./loader.js";
import { selectNodeDynamicRef, selectNodePropertyNamesEntries, selectNodeRef, selectNodeTypes, selectSubNodeAdditionalPropertiesEntries, selectSubNodeItemsEntries, selectSubNodePrefixItemsEntries, selectValidationMaximumExclusive, selectValidationMaximumInclusive, selectValidationMaximumItems, selectValidationMaximumLength, selectValidationMaximumProperties, selectValidationMinimumExclusive, selectValidationMinimumInclusive, selectValidationMinimumItems, selectValidationMinimumLength, selectValidationMinimumProperties, selectValidationMultipleOf, selectValidationRequired, selectValidationUniqueItems, selectValidationValuePattern } from "./selectors.js";

export class SchemaValidatorCodeGenerator extends SchemaValidatorCodeGeneratorBase {
    constructor(
        manager: SchemaManager,
        private readonly loader: SchemaLoader,
    ) {
        super(manager);
    }

    protected *generateValidatorFunctionBodyStatements(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeId: string,
    ): Iterable<ts.Statement> {
        const nodeItem = this.loader.getNodeItem(nodeId);

        yield* this.generateCommonValidationStatements(factory, namer, nodeId);

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
                    namer,
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
        namer: Namer,
        nodeId: string,
    ): Iterable<ts.Statement> {
        const nodeItem = this.loader.getNodeItem(nodeId);

        const nodeRef = selectNodeRef(nodeItem.node);
        if (nodeRef != null) {
            const resolvedNodeId = this.loader.resolveReferenceNodeId(
                nodeId,
                nodeRef,
            );

            const resolvedTypeName = namer.getName(resolvedNodeId).join("_");

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
            const resolvedNodeId = this.loader.resolveDynamicReferenceNodeId(
                nodeId,
                nodeDynamicRef,
            );

            const resolvedTypeName = namer.getName(resolvedNodeId).join("_");

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
        namer: Namer,
        nodeId: string,
    ) {
        const nodeItem = this.loader.getNodeItem(nodeId);

        const minItems = selectValidationMinimumItems(nodeItem.node);
        const maxItems = selectValidationMaximumItems(nodeItem.node);
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

        const prefixItemsEntries = selectSubNodePrefixItemsEntries(
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

                const typeName = namer.getName(subNodeId).join("_");

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

        const itemsEntries = selectSubNodeItemsEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );
        for (const [subNodePointer] of itemsEntries) {
            const subNodeUrl = new URL(
                `#${subNodePointer}`,
                nodeItem.nodeRootUrl,
            );
            const subNodeId = String(subNodeUrl);

            const typeName = namer.getName(subNodeId).join("_");

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
        namer: Namer,
        nodeId: string,
    ) {
        const nodeItem = this.loader.getNodeItem(nodeId);

        const minProperties = selectValidationMinimumProperties(nodeItem.node);
        const maxProperties = selectValidationMaximumProperties(nodeItem.node);
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

        const additionalPropertiesEntries = selectSubNodeAdditionalPropertiesEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );
        for (const [subNodePointer] of additionalPropertiesEntries) {
            const subNodeUrl = new URL(
                `#${subNodePointer}`,
                nodeItem.nodeRootUrl,
            );
            const subNodeId = String(subNodeUrl);

            const typeName = namer.getName(subNodeId).join("_");

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

            const typeName = namer.getName(subNodeId).join("_");

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
        namer: Namer,
        nodeId: string,
    ) {
        const nodeItem = this.loader.getNodeItem(nodeId);

        const minLength = selectValidationMinimumLength(nodeItem.node);
        const maxLength = selectValidationMaximumLength(nodeItem.node);
        const pattern = selectValidationValuePattern(nodeItem.node);

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
        namer: Namer,
        nodeId: string,
    ) {
        const nodeItem = this.loader.getNodeItem(nodeId);

        const minimum = selectValidationMinimumInclusive(nodeItem.node);
        const exclusiveMinimum = selectValidationMinimumExclusive(nodeItem.node);
        const maximum = selectValidationMaximumInclusive(nodeItem.node);
        const exclusiveMaximum = selectValidationMaximumExclusive(nodeItem.node);
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

