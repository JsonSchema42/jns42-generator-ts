import * as intermediate from "@jns42/jns42-schema-intermediate-a";
import * as fs from "fs";
import { SchemaStrategyBase, SchemaStrategyInterface } from "./strategy.js";

export class SchemaContext implements SchemaStrategyInterface {
	private readonly rootNodeMetaMap = new Map<string, string>();
	private readonly nodeMetaMap = new Map<string, string>();
	private readonly retrievalRootNodeMap = new Map<string, URL>();
	private readonly rootNodeRetrievalMap = new Map<string, URL>();

	private strategies: Record<string, SchemaStrategyBase<unknown>> = {};

	public registerStrategy(
		metaSchemaId: string,
		strategy: SchemaStrategyBase<unknown>
	) {
		strategy.registerContext(this);
		this.strategies[metaSchemaId] = strategy;
	}

	public getIntermediateData(): intermediate.SchemaJson {
		return {
			$schema:
				"https://schema.JsonSchema42.org/jns42-intermediate-a/schema.json",
			nodes: Object.fromEntries(this.getNodeEntries()),
		};
	}

	public *getNodeEntries(): Iterable<[string, intermediate.Node]> {
		for (const strategy of Object.values(this.strategies)) {
			yield* strategy.getNodeEntries();
		}
	}

	public async loadFromUrl(
		rootNodeUrl: URL,
		retrievalUrl: URL,
		referencingUrl: URL | null,
		defaultMetaSchemaId: string
	) {
		const retrievalId = String(retrievalUrl);

		const maybeRootNodeUrl = this.retrievalRootNodeMap.get(retrievalId);
		if (maybeRootNodeUrl != null) {
			return maybeRootNodeUrl;
		}

		const rootNode = await this.fetchJsonFromUrl(retrievalUrl);

		const metaSchemaId =
			this.discoverMetaSchemaId(rootNode) ?? defaultMetaSchemaId;

		const strategy: SchemaStrategyBase<unknown> = this.strategies[metaSchemaId];

		if (!strategy.isSchema(rootNode)) {
			throw new TypeError("invalid schema");
		}

		rootNodeUrl = strategy.makeNodeUrl(rootNode, retrievalUrl, "");

		const rootNodeId = String(rootNodeUrl);

		this.retrievalRootNodeMap.set(retrievalId, rootNodeUrl);
		this.rootNodeRetrievalMap.set(rootNodeId, retrievalUrl);
		this.rootNodeMetaMap.set(rootNodeId, metaSchemaId);

		for (const [
			subNodeUrl,
			subRetrievalUrl,
		] of strategy.selectAllReferencedNodeUrls(
			rootNode,
			rootNodeUrl,
			retrievalUrl
		)) {
			await this.loadFromUrl(
				subNodeUrl,
				subRetrievalUrl,
				rootNodeUrl,
				metaSchemaId
			);
		}

		await this.loadRootNode(
			rootNode,
			rootNodeUrl,
			referencingUrl,
			defaultMetaSchemaId
		);

		return rootNodeUrl;
	}

	public getNodeRetrievalUrl(nodeRootId: string) {
		return this.rootNodeRetrievalMap.get(nodeRootId);
	}

	public getNodeRootUrl(nodeRetrievalId: string) {
		return this.retrievalRootNodeMap.get(nodeRetrievalId);
	}

	private async loadRootNode(
		rootNode: unknown,
		rootNodeUrl: URL,
		referencingNodeUrl: URL | null,
		defaultMetaSchemaId: string
	) {
		const metaSchemaId =
			this.discoverMetaSchemaId(rootNode) ?? defaultMetaSchemaId;

		const strategy: SchemaStrategyBase<unknown> = this.strategies[metaSchemaId];

		await strategy.loadRootNode(rootNode, rootNodeUrl, referencingNodeUrl);

		for (const nodeUrl of strategy.indexRootNode(rootNodeUrl)) {
			const nodeId = String(nodeUrl);
			this.nodeMetaMap.set(nodeId, metaSchemaId);
		}
	}

	private async fetchJsonFromUrl(url: URL) {
		switch (url.protocol) {
			case "http:":
			case "http2:": {
				const result = await fetch(url);
				const schemaRootNode = (await result.json()) as unknown;

				return schemaRootNode;
			}

			case "file:": {
				const content = fs.readFileSync(url.pathname, "utf-8");

				const schemaRootNode = JSON.parse(content) as unknown;

				return schemaRootNode;
			}
		}
	}

	private discoverMetaSchemaId(node: unknown) {
		for (const [metaSchemaId, strategy] of Object.entries(this.strategies)) {
			if (strategy.isSchemaRootNode(node)) {
				return metaSchemaId;
			}
		}
	}
}
