import ts from "typescript";
import { generateLiteral, generatePrimitiveLiteral } from "../../utils/index.js";
import { SchemaCodeGeneratorBase } from "../code-generator.js";
import { SchemaManager } from "../manager.js";
import { SchemaIndexer, SchemaIndexerNodeItem } from "./indexer.js";
import { SchemaLoader } from "./loader.js";
import { selectNodeAdditionalPropertiesEntries, selectNodeAllOfEntries, selectNodeAnyOfEntries, selectNodeEnum, selectNodeItemsEntries as selectNodeAdditionalItemsEntries, selectNodeItemsEntries, selectNodeOneOfEntries, selectNodeProperties, selectNodeRef, selectNodeRequiredProperties, selectNodeType, selectValidationExclusiveMaximum, selectValidationExclusiveMinimum, selectValidationMaximum, selectValidationMaxItems, selectValidationMaxLength, selectValidationMaxProperties, selectValidationMinimum, selectValidationMinItems, selectValidationMinLength, selectValidationMinProperties, selectValidationMultipleOf, selectValidationPattern, selectValidationRequired, selectValidationUniqueItems } from "./selectors.js";

export class SchemaCodeGenerator extends SchemaCodeGeneratorBase {
    constructor(
        manager: SchemaManager,
        private readonly loader: SchemaLoader,
        private readonly indexer: SchemaIndexer,
    ) {
        super(manager);
    }

    public *generateStatements(
        factory: ts.NodeFactory,
        nodeId: string,
    ) {
        const typeName = this.manager.getName(nodeId);
        if (typeName == null) {
            throw new Error("typeName not found");
        }

        const nodeItem = this.indexer.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeItem not found");
        }

        yield this.generateSchemaTypeDeclarationStatement(
            factory,
            nodeId,
            nodeItem,
            typeName,
        );

        yield this.generateValidatorFunctionDeclarationStatement(
            factory,
            nodeId,
            nodeItem,
            typeName,
        );
    }

    //#region validation

    private generateValidatorFunctionDeclarationStatement(
        factory: ts.NodeFactory,
        nodeId: string,
        nodeItem: SchemaIndexerNodeItem,
        typeName: string,
    ): ts.FunctionDeclaration {
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
            factory.createBlock(
                [...this.generateValidatorFunctionBodyStatements(factory, nodeItem)],
                true,
            ),
        );
    }

    private *generateValidatorFunctionBodyStatements(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ): Iterable<ts.Statement> {

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
                    nodeItem,
                    type,
                    statement,
                );
            }
            yield statement;
        }

    }

    private generateTypeValidationIfStatement(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
        type: string,
        elseStatement: ts.Statement,
    ) {
        const thenBlock = factory.createBlock(
            [
                ...this.generateTypeValidationStatements(factory, type, nodeItem),
            ],
            true,
        );

        const testExpression = this.generateCallValidateTypeExpression(
            factory,
            type,
        );

        return factory.createIfStatement(
            testExpression,
            thenBlock,
            elseStatement,
        );
    }

    private generateCallValidatorExpression(
        factory: ts.NodeFactory,
        validatorName: string,
        validateArgument: unknown,
    ) {

        return factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createIdentifier("validation"),
                validatorName,
            ),
            undefined,
            [
                factory.createIdentifier("value"),
                generateLiteral(factory, validateArgument),
            ],
        );
    }

    private generateCallValidateTypeExpression(
        factory: ts.NodeFactory,
        type: unknown,
    ) {

        switch (type) {
            case "null":
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("validation"),
                        factory.createIdentifier("isValidNullType"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                    ],
                );

            case "array":
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("validation"),
                        factory.createIdentifier("isValidArrayType"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                    ],
                );

            case "object":
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("validation"),
                        factory.createIdentifier("isValidObjectType"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                    ],
                );

            case "string":
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("validation"),
                        factory.createIdentifier("isValidStringType"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                    ],
                );

            case "number":
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("validation"),
                        factory.createIdentifier("isValidNumberType"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                    ],
                );

            case "integer":
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("validation"),
                        factory.createIdentifier("isValidIntegerType"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                    ],
                );

            case "boolean":
                return factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier("validation"),
                        factory.createIdentifier("isValidBooleanType"),
                    ),
                    undefined,
                    [
                        factory.createIdentifier("value"),
                    ],
                );

            default:
                throw new Error("type not supported");
        }
    }

    private *generateTypeValidationStatements(
        factory: ts.NodeFactory,
        type: string,
        nodeItem: SchemaIndexerNodeItem,
    ) {
        switch (type) {
            case "null":
                break;

            case "array":
                yield* this.generateArrayTypeValidationStatements(factory, nodeItem);
                break;

            case "object":
                yield* this.generateObjectTypeValidationStatements(factory, nodeItem);
                break;

            case "string":
                yield* this.generateStringTypeValidationStatements(factory, nodeItem);
                break;

            case "number":
            case "integer":
                yield* this.generateNumberTypeValidationStatements(factory, nodeItem);
                break;

            case "boolean":
                break;

            default:
                throw new Error("type not supported");
        }
    }

    private *generateArrayTypeValidationStatements(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ) {
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
                    nodeItem.nodeBaseUrl,
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
                nodeItem.nodeBaseUrl,
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

    private *generateObjectTypeValidationStatements(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ) {
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
                nodeItem.nodeBaseUrl,
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
                nodeItem.nodeBaseUrl,
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

    private * generateStringTypeValidationStatements(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ) {
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

    private * generateNumberTypeValidationStatements(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ) {
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

    private wrapValidationExpression(
        factory: ts.NodeFactory,
        testExpression: ts.Expression,
    ) {
        return factory.createIfStatement(
            testExpression,
            factory.createBlock([
                factory.createExpressionStatement(factory.createYieldExpression(
                    undefined,
                    factory.createIdentifier("path"),
                )),
            ]),
        );
    }

    //#endregion

    //#region types

    private generateSchemaTypeDeclarationStatement(
        factory: ts.NodeFactory,
        nodeId: string,
        nodeItem: SchemaIndexerNodeItem,
        typeName: string,
    ) {
        return factory.createTypeAliasDeclaration(
            [
                factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            typeName,
            undefined,
            this.generateTypeNode(
                factory,
                nodeItem,
            ),
        );
    }

    private generateTypeNode(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ): ts.TypeNode {
        const typeNodes = [...this.generateTypeNodes(factory, nodeItem)];
        if (typeNodes.length === 0) {
            return factory.createKeywordTypeNode(
                ts.SyntaxKind.UnknownKeyword,
            );
        }
        return factory.createParenthesizedType(factory.createIntersectionTypeNode(
            typeNodes,
        ));
    }

    private * generateTypeNodes(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ): Iterable<ts.TypeNode> {
        if (nodeItem.node === true) {
            yield factory.createKeywordTypeNode(
                ts.SyntaxKind.AnyKeyword,
            );
            return;
        }

        if (nodeItem.node === false) {
            yield factory.createKeywordTypeNode(
                ts.SyntaxKind.NeverKeyword,
            );
            return;
        }

        const nodeRef = selectNodeRef(nodeItem.node);
        if (nodeRef != null) {
            const nodeUrl = new URL(nodeRef, nodeItem.nodeBaseUrl);
            const nodeId = String(nodeUrl);
            yield this.generateTypeReference(
                factory,
                nodeId,
            );
        }

        const enumValues = selectNodeEnum(nodeItem.node);
        if (enumValues != null) {
            yield factory.createParenthesizedType(factory.createUnionTypeNode(
                enumValues.map(value => factory.createLiteralTypeNode(generatePrimitiveLiteral(
                    factory,
                    value,
                ))),
            ));
        }

        const anyOfEntries = [...selectNodeAnyOfEntries(nodeItem.nodePointer, nodeItem.node)];
        if (anyOfEntries.length > 0) {
            yield factory.createParenthesizedType(factory.createUnionTypeNode(
                anyOfEntries.map(([subNodePointer]) => {
                    const subNodeUrl = new URL(
                        `#${subNodePointer}`,
                        nodeItem.nodeBaseUrl,
                    );
                    const subNodeId = String(subNodeUrl);
                    return this.generateTypeReference(
                        factory,
                        subNodeId,
                    );
                }),
            ));
        }

        const oneOfEntries = [...selectNodeOneOfEntries(nodeItem.nodePointer, nodeItem.node)];
        if (oneOfEntries.length > 0) {
            yield factory.createParenthesizedType(factory.createUnionTypeNode(
                oneOfEntries.map(([subNodePointer]) => {
                    const subNodeUrl = new URL(
                        `#${subNodePointer}`,
                        nodeItem.nodeBaseUrl,
                    );
                    const subNodeId = String(subNodeUrl);
                    return this.generateTypeReference(
                        factory,
                        subNodeId,
                    );
                }),
            ));
        }

        const allOfEntries = [...selectNodeAllOfEntries(nodeItem.nodePointer, nodeItem.node)];
        if (allOfEntries.length > 0) {
            yield factory.createParenthesizedType(factory.createIntersectionTypeNode(
                allOfEntries.map(([subNodePointer]) => {
                    const subNodeUrl = new URL(
                        `#${subNodePointer}`,
                        nodeItem.nodeBaseUrl,
                    );
                    const subNodeId = String(subNodeUrl);
                    return this.generateTypeReference(
                        factory,
                        subNodeId,
                    );
                }),
            ));
        }

        const types = selectNodeType(nodeItem.node);
        if (types != null) {
            yield factory.createParenthesizedType(factory.createUnionTypeNode(
                types.map(type => this.generateTypeDefinition(
                    factory,
                    type,
                    nodeItem,
                )),
            ));
        }

    }

    private generateTypeDefinition(
        factory: ts.NodeFactory,
        type: string,
        nodeItem: SchemaIndexerNodeItem,
    ): ts.TypeNode {
        switch (type) {
            case "null":
                return factory.createLiteralTypeNode(
                    factory.createNull(),
                );

            case "boolean":
                return factory.createKeywordTypeNode(
                    ts.SyntaxKind.BooleanKeyword,
                );

            case "number":
            case "integer":
                return factory.createKeywordTypeNode(
                    ts.SyntaxKind.NumberKeyword,
                );

            case "string":
                return factory.createKeywordTypeNode(
                    ts.SyntaxKind.StringKeyword,
                );

            case "object":
                return this.generateObjectTypeDefinition(
                    factory,
                    nodeItem,
                );

            case "array":
                return this.generateArrayTypeDefinition(
                    factory,
                    nodeItem,
                );

            default:
                throw new Error("type not supported");

        }
    }

    private generateObjectTypeDefinition(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ): ts.TypeNode {
        const additionalPropertiesEntries = selectNodeAdditionalPropertiesEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );

        for (const [subNodePointer] of additionalPropertiesEntries) {
            const subNodeUrl = new URL(
                `#${subNodePointer}`,
                nodeItem.nodeBaseUrl,
            );
            const subNodeId = String(subNodeUrl);

            return factory.createTypeReferenceNode(
                "Record",
                [
                    factory.createKeywordTypeNode(
                        ts.SyntaxKind.StringKeyword,
                    ),
                    this.generateTypeReference(
                        factory,
                        subNodeId,
                    ),
                ],
            );
        }

        const propertiesEntries = [...selectNodeProperties(nodeItem.nodePointer, nodeItem.node)];
        const propertiesSet = new Set(propertiesEntries.map(([name]) => name));
        const requiredPropertiesSet = new Set(selectNodeRequiredProperties(nodeItem.node));

        return factory.createTypeLiteralNode([
            ...propertiesEntries.map(
                ([propertyName, subNodePointer]) => {
                    const subNodeUrl = new URL(
                        `#${subNodePointer}`,
                        nodeItem.nodeBaseUrl,
                    );
                    const subNodeId = String(subNodeUrl);
                    return factory.createPropertySignature(
                        undefined,
                        propertyName,
                        requiredPropertiesSet.has(propertyName) ?
                            undefined :
                            factory.createToken(ts.SyntaxKind.QuestionToken),
                        this.generateTypeReference(
                            factory,
                            subNodeId,
                        ),
                    );
                },
            ),
            ...[...requiredPropertiesSet].
                filter(propertyName => !propertiesSet.has(propertyName)).
                map(propertyName => factory.createPropertySignature(
                    undefined,
                    propertyName,
                    undefined,
                    factory.createKeywordTypeNode(
                        ts.SyntaxKind.AnyKeyword,
                    ),
                )),
        ]);
    }

    private generateArrayTypeDefinition(
        factory: ts.NodeFactory,
        nodeItem: SchemaIndexerNodeItem,
    ): ts.TypeNode {
        const additionalItemsEntries = selectNodeAdditionalItemsEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        );
        for (const [subNodePointer] of additionalItemsEntries) {
            const subNodeUrl = new URL(
                `#${subNodePointer}`,
                nodeItem.nodeBaseUrl,
            );
            const subNodeId = String(subNodeUrl);
            return factory.createTypeReferenceNode(
                "Array",
                [
                    this.generateTypeReference(factory, subNodeId),
                ],
            );
        }

        const itemsEntries = [...selectNodeItemsEntries(
            nodeItem.nodePointer,
            nodeItem.node,
        )];

        if (itemsEntries.length > 0) {
            return factory.createTupleTypeNode(
                itemsEntries.map(
                    ([subNodePointer]) => {
                        const subNodeUrl = new URL(
                            `#${subNodePointer}`,
                            nodeItem.nodeBaseUrl,
                        );
                        const subNodeId = String(subNodeUrl);
                        return this.generateTypeReference(factory, subNodeId);
                    },
                ),
            );
        }

        return factory.createTypeReferenceNode(
            "Array",
            [
                factory.createKeywordTypeNode(
                    ts.SyntaxKind.UnknownKeyword,
                ),
            ],
        );
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

    //#endregion

}

