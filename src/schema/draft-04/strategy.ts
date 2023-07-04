import { Draft04Schema, isDraft04Schema } from "@jns42/jns42-schema-draft-04";
import * as intermediate from "@jns42/jns42-schema-intermediate-a";
import { SchemaStrategyBase } from "../strategy.js";
import { metaSchemaId } from "./meta.js";
import {
	selectAllSubNodesAndSelf,
	selectNodeDescription,
	selectNodeEnum,
	selectNodeId,
	selectNodePropertyNamesEntries,
	selectNodeRef,
	selectNodeSchema,
	selectNodeTitle,
	selectNodeTypes,
	selectSubNodeAdditionalItemsEntries,
	selectSubNodeAdditionalPropertiesEntries,
	selectSubNodeAllOfEntries,
	selectSubNodeAnyOfEntries,
	selectSubNodeItemsManyEntries,
	selectSubNodeItemsOneEntries,
	selectSubNodeOneOfEntries,
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

export class SchemaStrategy extends SchemaStrategyBase<
	Draft04Schema | boolean
> {
	//#region super implementation

	protected readonly metaSchemaId = metaSchemaId;

	public isSchemaRootNode(node: unknown): node is Draft04Schema {
		const schemaId = selectNodeSchema(node as any);
		if (schemaId == null) {
			return false;
		}
		return schemaId === this.metaSchemaId;
	}
	public isSchema(node: unknown): node is Draft04Schema {
		return isDraft04Schema(node);
	}

	public makeNodeUrl(
		node: Draft04Schema,
		nodeRootUrl: URL,
		nodePointer: string
	): URL {
		let nodeUrl = this.selectNodeUrl(node);
		if (nodeUrl != null) {
			return nodeUrl;
		}

		nodeUrl = new URL(`#${nodePointer}`, nodeRootUrl);
		return nodeUrl;
	}

	public selectNodeUrl(node: Draft04Schema) {
		const nodeId = selectNodeId(node);
		if (nodeId != null) {
			const nodeUrl = new URL(nodeId);
			return nodeUrl;
		}
	}

	public selectAllSubNodeEntriesAndSelf(
		nodePointer: string,
		node: Draft04Schema
	): Iterable<readonly [string, boolean | Draft04Schema]> {
		return selectAllSubNodesAndSelf(nodePointer, node);
	}
	public *selectAllReferencedNodeUrls(
		rootNode: Draft04Schema,
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

	protected async loadFromNode(
		node: Draft04Schema,
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

	//#endregion

	//#region strategy implementation

	public *getNodeEntries(): Iterable<[string, intermediate.Node]> {
		for (const [nodeId, { node }] of this.getNodeItemEntries()) {
			const title = selectNodeTitle(node) ?? "";
			const description = selectNodeDescription(node) ?? "";
			const deprecated = false;
			const examples = new Array<unknown>();

			let superNodeId: string | undefined;

			const nodeRef = selectNodeRef(node);

			if (nodeRef != null) {
				const resolvedNodeId = this.resolveReferenceNodeId(nodeId, nodeRef);

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
		node: Draft04Schema | boolean
	): Iterable<intermediate.TypeUnion> {
		const enumValues = selectNodeEnum(node) as unknown[];

		let options: Array<boolean> | undefined;

		if (enumValues != null) {
			options = [...enumValues] as boolean[];
		}

		yield {
			type: "boolean",
			options,
		};
	}

	private *makeNodeTypeFromNumber(
		node: Draft04Schema | boolean,
		numberType: "integer" | "float"
	): Iterable<intermediate.TypeUnion> {
		const enumValues = selectNodeEnum(node) as unknown[];

		let options: Array<number> | undefined;

		if (enumValues != null) {
			options = [...enumValues] as number[];
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
		node: Draft04Schema | boolean
	): Iterable<intermediate.TypeUnion> {
		const enumValues = selectNodeEnum(node) as unknown[];

		let options: Array<string> | undefined;

		if (enumValues != null) {
			options = [...enumValues] as string[];
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
		node: Draft04Schema | boolean,
		nodeRootUrl: URL,
		nodePointer: string
	): Iterable<intermediate.TypeUnion> {
		const itemsOne = [...selectSubNodeItemsOneEntries(nodePointer, node)];
		const itemsMany = [...selectSubNodeItemsManyEntries(nodePointer, node)];
		const additionalItems = [
			...selectSubNodeAdditionalItemsEntries(nodePointer, node),
		];
		const minimumItems = selectValidationMinimumItems(node);
		const maximumItems = selectValidationMaximumItems(node);
		const uniqueItems = selectValidationUniqueItems(node) ?? false;

		if (itemsMany.length > 0) {
			const itemTypeNodeIds = itemsMany.map(([itemNodePointer]) => {
				const itemNodeUrl = new URL(`#${itemNodePointer}`, nodeRootUrl);
				const itemNodeId = String(itemNodeUrl);
				return itemNodeId;
			});

			yield {
				type: "tuple",
				itemTypeNodeIds: itemTypeNodeIds,
			};
		} else if (itemsOne.length > 0) {
			const itemTypeNodeIds = itemsOne.map(([itemNodePointer]) => {
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
		} else if (additionalItems.length > 0) {
			const itemTypeNodeIds = additionalItems.map(([itemNodePointer]) => {
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
		node: Draft04Schema | boolean,
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
		} else if (additionalProperties.length > 0) {
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
		node: Draft04Schema | boolean,
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
		node: Draft04Schema | boolean,
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
		node: Draft04Schema | boolean,
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

	private resolveReferenceNodeId(nodeId: string, nodeRef: string) {
		const nodeItem = this.getNodeItem(nodeId);

		const nodeRootId = String(nodeItem.nodeRootUrl);
		const nodeRetrievalUrl = this.context.getNodeRetrievalUrl(nodeRootId);

		const nodeRefRetrievalUrl = new URL(nodeRef, nodeRetrievalUrl);
		let hash = nodeRefRetrievalUrl.hash;
		if (hash.length === 0) {
			hash = "#";
		}
		nodeRefRetrievalUrl.hash = "";
		const nodeRefRetrievalId = String(nodeRefRetrievalUrl);
		const nodeRefRootUrl = this.context.getNodeRootUrl(nodeRefRetrievalId);

		const resolvedNodeUrl = new URL(hash, nodeRefRootUrl);
		const resolvedNodeId = String(resolvedNodeUrl);

		return resolvedNodeId;
	}

	//#endregion
}
