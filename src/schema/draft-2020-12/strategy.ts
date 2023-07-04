import {
	Draft202012Schema,
	isDraft202012Schema,
} from "@jns42/jns42-schema-draft-2020-12";
import * as intermediate from "@jns42/jns42-schema-intermediate-a";
import { SchemaStrategyBase } from "../strategy.js";
import { metaSchemaId } from "./meta.js";
import {
	selectAllSubNodesAndSelf,
	selectNodeAnchor,
	selectNodeConst,
	selectNodeDeprecated,
	selectNodeDescription,
	selectNodeDynamicAnchor,
	selectNodeDynamicRef,
	selectNodeEnum,
	selectNodeExamples,
	selectNodeId,
	selectNodePropertyNamesEntries,
	selectNodeRef,
	selectNodeSchema,
	selectNodeTitle,
	selectNodeTypes,
	selectSubNodeAdditionalPropertiesEntries,
	selectSubNodeAllOfEntries,
	selectSubNodeAnyOfEntries,
	selectSubNodeItemsEntries,
	selectSubNodeOneOfEntries,
	selectSubNodePrefixItemsEntries,
	selectValidationMaximumExclusive,
	selectValidationMaximumInclusive,
	selectValidationMaximumItems,
	selectValidationMaximumLength,
	selectValidationMaximumProperties,
	selectValidationMinimumExclusive,
	selectValidationMinimumInclusive,
	selectValidationMinimumItems,
	selectValidationMinimumLength,
	selectValidationMinimumProperties,
	selectValidationMultipleOf,
	selectValidationRequired,
	selectValidationUniqueItems,
	selectValidationValuePattern,
} from "./selectors.js";

export class SchemaStrategy extends SchemaStrategyBase<Draft202012Schema> {
	//#region super implementation

	protected readonly metaSchemaId = metaSchemaId;

	public isSchemaRootNode(node: unknown): node is Draft202012Schema {
		const schemaId = selectNodeSchema(node as Draft202012Schema);
		if (schemaId == null) {
			return false;
		}
		return schemaId === this.metaSchemaId;
	}

	public isSchema(node: unknown): node is Draft202012Schema {
		return isDraft202012Schema(node);
	}

	protected async loadFromNode(
		node: Draft202012Schema,
		nodeUrl: URL,
		retrievalUrl: URL
	) {
		const nodeRef = selectNodeRef(node);

		if (nodeRef != null) {
			const nodeRefUrl = new URL(nodeRef, nodeUrl);
			const retrievalRefUrl = new URL(nodeRef, retrievalUrl);
			retrievalRefUrl.hash = "";
			await this.context.loadFromUrl(
				nodeRefUrl,
				retrievalRefUrl,
				nodeUrl,
				this.metaSchemaId
			);
		}
	}

	public makeNodeUrl(
		node: Draft202012Schema,
		nodeRootUrl: URL,
		nodePointer: string
	): URL {
		let nodeUrl = this.selectNodeUrl(node);
		if (nodeUrl != null) {
			return nodeUrl;
		}

		nodeUrl = new URL(nodePointer === "" ? "" : `#${nodePointer}`, nodeRootUrl);
		return nodeUrl;
	}

	public selectAllSubNodeEntriesAndSelf(
		nodePointer: string,
		node: Draft202012Schema
	): Iterable<readonly [string, Draft202012Schema]> {
		return selectAllSubNodesAndSelf(nodePointer, node);
	}

	public *selectAllReferencedNodeUrls(
		rootNode: Draft202012Schema,
		rootNodeUrl: URL,
		retrievalUrl: URL
	): Iterable<readonly [URL, URL]> {
		for (const [pointer, node] of selectAllSubNodesAndSelf("", rootNode)) {
			const nodeRef = selectNodeRef(node);
			if (nodeRef == null) {
				continue;
			}

			const refNodeUrl = new URL(nodeRef, rootNodeUrl);
			const refRetrievalUrl = new URL(nodeRef, retrievalUrl);
			refRetrievalUrl.hash = "";

			yield [refNodeUrl, refRetrievalUrl] as const;
		}
	}

	public selectNodeUrl(node: Draft202012Schema) {
		const nodeId = selectNodeId(node);
		if (nodeId != null) {
			const nodeUrl = new URL(nodeId);
			return nodeUrl;
		}
	}

	//#endregion

	//#region strategy implementation

	public *getNodeEntries(): Iterable<[string, intermediate.Node]> {
		for (const [nodeId, { node }] of this.getNodeItemEntries()) {
			const title = selectNodeTitle(node) ?? "";
			const description = selectNodeDescription(node) ?? "";
			const deprecated = selectNodeDeprecated(node) ?? false;
			const examples = selectNodeExamples(node) ?? [];

			let superNodeId: string | undefined;

			const nodeRef = selectNodeRef(node);

			if (nodeRef != null) {
				const resolvedNodeId = this.resolveReferenceNodeId(nodeId, nodeRef);

				superNodeId = resolvedNodeId;
			}

			const nodeDynamicRef = selectNodeDynamicRef(node);
			if (nodeDynamicRef != null) {
				const resolvedNodeId = this.resolveDynamicReferenceNodeId(
					nodeId,
					nodeDynamicRef
				);

				superNodeId = resolvedNodeId;
			}

			const types = [...this.selectNodeTypes(nodeId)];
			const compounds = [...this.selectNodeCompounds(nodeId)];

			yield [
				nodeId,
				{
					superNodeId,
					deprecated,
					title,
					description,
					examples,
					types,
					compounds,
				},
			];
		}
	}

	private *selectNodeTypes(nodeId: string): Iterable<intermediate.TypeUnion> {
		const nodeItem = this.getNodeItem(nodeId);

		if (nodeItem.node === true) {
			yield {
				type: "any",
			};
		}

		if (nodeItem.node === false) {
			yield {
				type: "never",
			};
		}

		const types = selectNodeTypes(nodeItem.node);
		if (types != null) {
			for (const type of types) {
				switch (type) {
					case "null":
						yield* this.makeNodeTypeFromNull();
						break;

					case "boolean":
						yield* this.makeNodeTypeFromBoolean(nodeItem.node);
						break;

					case "integer":
						yield* this.makeNodeTypeFromNumber(nodeItem.node, "integer");
						break;

					case "number":
						yield* this.makeNodeTypeFromNumber(nodeItem.node, "float");
						break;

					case "string":
						yield* this.makeNodeTypeFromString(nodeItem.node);
						break;

					case "array":
						yield* this.makeNodeTypeFromArray(
							nodeItem.node,
							nodeItem.nodeRootUrl,
							nodeItem.nodePointer
						);
						break;

					case "object":
						yield* this.makeNodeTypeFromObject(
							nodeItem.node,
							nodeItem.nodeRootUrl,
							nodeItem.nodePointer
						);
						break;
				}
			}
		}
	}

	private *selectNodeCompounds(
		nodeId: string
	): Iterable<intermediate.CompoundUnion> {
		const nodeItem = this.getNodeItem(nodeId);

		yield* this.makeNodeCompoundFromAllOf(
			nodeItem.node,
			nodeItem.nodeRootUrl,
			nodeItem.nodePointer
		);
		yield* this.makeNodeCompoundFromAnyOf(
			nodeItem.node,
			nodeItem.nodeRootUrl,
			nodeItem.nodePointer
		);
		yield* this.makeNodeCompoundFromOneOf(
			nodeItem.node,
			nodeItem.nodeRootUrl,
			nodeItem.nodePointer
		);
	}

	private *makeNodeTypeFromNull(): Iterable<intermediate.TypeUnion> {
		yield {
			type: "null",
		};
	}

	private *makeNodeTypeFromBoolean(
		node: Draft202012Schema
	): Iterable<intermediate.TypeUnion> {
		const enumValues = selectNodeEnum(node);
		const constValue = selectNodeConst(node);

		let options: Array<boolean> | undefined;

		if (constValue != null) {
			options = [constValue];
		} else if (enumValues != null) {
			options = [...enumValues];
		}

		yield {
			type: "boolean",
			options,
		};
	}

	private *makeNodeTypeFromNumber(
		node: Draft202012Schema,
		numberType: "integer" | "float"
	): Iterable<intermediate.TypeUnion> {
		const enumValues = selectNodeEnum(node);
		const constValue = selectNodeConst(node);

		let options: Array<number> | undefined;

		if (constValue != null) {
			options = [constValue];
		} else if (enumValues != null) {
			options = [...enumValues];
		}

		const minimumInclusive = selectValidationMinimumInclusive(node);
		const minimumExclusive = selectValidationMinimumExclusive(node);
		const maximumInclusive = selectValidationMaximumInclusive(node);
		const maximumExclusive = selectValidationMaximumExclusive(node);
		const multipleOf = selectValidationMultipleOf(node);

		yield {
			type: "number",
			numberType,
			options,
			minimumInclusive,
			minimumExclusive,
			maximumInclusive,
			maximumExclusive,
			multipleOf,
		};
	}

	private *makeNodeTypeFromString(
		node: Draft202012Schema
	): Iterable<intermediate.TypeUnion> {
		const enumValues = selectNodeEnum(node);
		const constValue = selectNodeConst(node);

		let options: Array<string> | undefined;

		if (constValue != null) {
			options = [constValue];
		} else if (enumValues != null) {
			options = [...enumValues];
		}

		const minimumLength = selectValidationMinimumLength(node);
		const maximumLength = selectValidationMaximumLength(node);
		const valuePattern = selectValidationValuePattern(node);

		yield {
			type: "string",
			options,
			minimumLength,
			maximumLength,
			valuePattern,
		};
	}

	private *makeNodeTypeFromArray(
		node: Draft202012Schema,
		nodeRootUrl: URL,
		nodePointer: string
	): Iterable<intermediate.TypeUnion> {
		const items = [...selectSubNodeItemsEntries(nodePointer, node)];
		const prefixItems = [...selectSubNodePrefixItemsEntries(nodePointer, node)];
		const minimumItems = selectValidationMinimumItems(node);
		const maximumItems = selectValidationMaximumItems(node);
		const uniqueItems = selectValidationUniqueItems(node) ?? false;

		if (prefixItems.length > 0) {
			const itemTypeNodeIds = prefixItems.map(([itemNodePointer]) => {
				const itemNodeUrl = new URL(`#${itemNodePointer}`, nodeRootUrl);
				const itemNodeId = String(itemNodeUrl);
				return itemNodeId;
			});

			yield {
				type: "tuple",
				itemTypeNodeIds: itemTypeNodeIds,
			};
		}

		if (items.length > 0) {
			const itemTypeNodeIds = items.map(([itemNodePointer]) => {
				const itemNodeUrl = new URL(`#${itemNodePointer}`, nodeRootUrl);
				const itemNodeId = String(itemNodeUrl);
				return itemNodeId;
			});

			for (const itemTypeNodeId of itemTypeNodeIds) {
				yield {
					type: "array",
					minimumItems,
					maximumItems,
					uniqueItems,
					itemTypeNodeId,
				};
			}
		}
	}

	private *makeNodeTypeFromObject(
		node: Draft202012Schema,
		nodeRootUrl: URL,
		nodePointer: string
	): Iterable<intermediate.TypeUnion> {
		const propertyNames = [
			...selectNodePropertyNamesEntries(nodePointer, node),
		];
		const additionalProperties = [
			...selectSubNodeAdditionalPropertiesEntries(nodePointer, node),
		];
		const minimumProperties = selectValidationMinimumProperties(node);
		const maximumProperties = selectValidationMaximumProperties(node);

		const requiredProperties = selectValidationRequired(node) ?? [];

		if (propertyNames.length > 0) {
			const propertyTypeNodeIds = Object.fromEntries(
				propertyNames.map(([propertyNodePointer, propertyName]) => {
					const propertyNodeUrl = new URL(
						`#${propertyNodePointer}`,
						nodeRootUrl
					);
					const propertyNodeId = String(propertyNodeUrl);
					return [propertyName, propertyNodeId];
				})
			);

			yield {
				type: "interface",
				requiredProperties,
				propertyTypeNodeIds,
			};
		}

		if (additionalProperties.length > 0) {
			const propertyTypeNodeIds = additionalProperties.map(
				([propertyNodePointer]) => {
					const propertyNodeUrl = new URL(
						`#${propertyNodePointer}`,
						nodeRootUrl
					);
					const propertyNodeId = String(propertyNodeUrl);
					return propertyNodeId;
				}
			);

			for (const propertyTypeNodeId of propertyTypeNodeIds) {
				yield {
					type: "record",
					minimumProperties,
					maximumProperties,
					requiredProperties,
					propertyTypeNodeId,
				};
			}
		}
	}

	private *makeNodeCompoundFromAllOf(
		node: Draft202012Schema,
		nodeRootUrl: URL,
		nodePointer: string
	): Iterable<intermediate.CompoundUnion> {
		const allOf = [...selectSubNodeAllOfEntries(nodePointer, node)];
		if (allOf.length > 0) {
			const typeNodeIds = allOf.map(([typeNodePointer]) => {
				const typeNodeUrl = new URL(`#${typeNodePointer}`, nodeRootUrl);
				const typeNodeId = String(typeNodeUrl);
				return typeNodeId;
			});

			yield {
				type: "all-of",
				typeNodeIds,
			};
		}
	}

	private *makeNodeCompoundFromAnyOf(
		node: Draft202012Schema,
		nodeRootUrl: URL,
		nodePointer: string
	): Iterable<intermediate.CompoundUnion> {
		const allOf = [...selectSubNodeAnyOfEntries(nodePointer, node)];
		if (allOf.length > 0) {
			const typeNodeIds = allOf.map(([typeNodePointer]) => {
				const typeNodeUrl = new URL(`#${typeNodePointer}`, nodeRootUrl);
				const typeNodeId = String(typeNodeUrl);
				return typeNodeId;
			});

			yield {
				type: "any-of",
				typeNodeIds,
			};
		}
	}

	private *makeNodeCompoundFromOneOf(
		node: Draft202012Schema,
		nodeRootUrl: URL,
		nodePointer: string
	): Iterable<intermediate.CompoundUnion> {
		const allOf = [...selectSubNodeOneOfEntries(nodePointer, node)];
		if (allOf.length > 0) {
			const typeNodeIds = allOf.map(([typeNodePointer]) => {
				const typeNodeUrl = new URL(`#${typeNodePointer}`, nodeRootUrl);
				const typeNodeId = String(typeNodeUrl);
				return typeNodeId;
			});

			yield {
				type: "one-of",
				typeNodeIds,
			};
		}
	}

	//#endregion

	//#region references

	private readonly anchorMap = new Map<string, string>();
	private readonly dynamicAnchorMap = new Map<string, string>();

	private getAnchorNodeId(nodeId: string) {
		return this.anchorMap.get(nodeId);
	}

	private getDynamicAnchorNodeId(nodeId: string) {
		return this.dynamicAnchorMap.get(nodeId);
	}

	private resolveReferenceNodeId(nodeId: string, nodeRef: string) {
		const nodeItem = this.getNodeItem(nodeId);

		const nodeRootId = String(nodeItem.nodeRootUrl);
		const nodeRetrievalUrl = this.context.getNodeRetrievalUrl(nodeRootId);

		const nodeRefRetrievalUrl = new URL(nodeRef, nodeRetrievalUrl);
		const hash = nodeRefRetrievalUrl.hash;
		nodeRefRetrievalUrl.hash = "";
		const nodeRefRetrievalId = String(nodeRefRetrievalUrl);
		const nodeRefRootUrl = this.context.getNodeRootUrl(nodeRefRetrievalId);

		const resolvedNodeUrl = new URL(hash, nodeRefRootUrl);
		let resolvedNodeId = String(resolvedNodeUrl);

		const anchorNodeId = this.getAnchorNodeId(resolvedNodeId);

		if (anchorNodeId != null) {
			resolvedNodeId = anchorNodeId;
		}

		return resolvedNodeId;
	}

	private resolveDynamicReferenceNodeId(
		nodeId: string,
		nodeDynamicRef: string
	) {
		const nodeItem = this.getNodeItem(nodeId);

		const nodeRootId = String(nodeItem.nodeRootUrl);
		const nodeRetrievalUrl = this.context.getNodeRetrievalUrl(nodeRootId);

		const nodeRefRetrievalUrl = new URL(nodeDynamicRef, nodeRetrievalUrl);
		const hash = nodeRefRetrievalUrl.hash;
		nodeRefRetrievalUrl.hash = "";
		const nodeRefRetrievalId = String(nodeRefRetrievalUrl);
		const nodeRefRootUrl = this.context.getNodeRootUrl(nodeRefRetrievalId);

		const resolvedNodeUrl = new URL(hash, nodeRefRootUrl);
		let resolvedNodeId = String(resolvedNodeUrl);

		let currentRootNodeUrl: URL | null = new URL("", resolvedNodeUrl);
		while (currentRootNodeUrl != null) {
			const currentRootNodeId = String(currentRootNodeUrl);
			const currentRootNode = this.getRootNodeItem(currentRootNodeId);

			const currentNodeUrl = new URL(hash, currentRootNode.nodeUrl);
			const currentNodeId = String(currentNodeUrl);
			const dynamicAnchorNodeId = this.getDynamicAnchorNodeId(currentNodeId);
			if (dynamicAnchorNodeId != null) {
				resolvedNodeId = dynamicAnchorNodeId;
			}

			currentRootNodeUrl = currentRootNode.referencingNodeUrl;
		}

		return resolvedNodeId;
	}

	/*
    override the super function to load dynamic anchors
    */
	protected *indexNode(
		node: Draft202012Schema,
		nodeRootUrl: URL,
		nodePointer: string
	) {
		const nodeUrl = this.makeNodeUrl(node, nodeRootUrl, nodePointer);
		const nodeId = String(nodeUrl);

		const nodeAnchor = selectNodeAnchor(node);
		if (nodeAnchor != null) {
			const anchorUrl = new URL(`#${nodeAnchor}`, nodeRootUrl);
			const anchorId = String(anchorUrl);
			if (this.anchorMap.has(anchorId)) {
				throw new Error("duplicate anchorId");
			}
			this.anchorMap.set(anchorId, nodeId);

			yield anchorUrl;
		}

		const nodeDynamicAnchor = selectNodeDynamicAnchor(node);
		if (nodeDynamicAnchor != null) {
			const dynamicAnchorUrl = new URL(`#${nodeDynamicAnchor}`, nodeRootUrl);
			const dynamicAnchorId = String(dynamicAnchorUrl);
			if (this.dynamicAnchorMap.has(dynamicAnchorId)) {
				throw new Error("duplicate dynamicAnchorId");
			}
			this.dynamicAnchorMap.set(dynamicAnchorId, nodeId);

			// TODO should wel yield this?
			// yield dynamicAnchorUrl;
		}

		yield* super.indexNode(node, nodeRootUrl, nodePointer);
	}

	//#endregion
}
