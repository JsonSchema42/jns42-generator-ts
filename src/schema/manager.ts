import * as fs from "fs";
import ts from "typescript";
import { discoverRootNodeMetaSchemaKey, MetaSchemaKey } from "./meta.js";
import * as schema201909 from "./schema-2019-09/index.js";
import * as schema202012 from "./schema-2020-12/index.js";
import * as schemaDraft04 from "./schema-draft-04/index.js";
import * as schemaDraft06 from "./schema-draft-06/index.js";
import * as schemaDraft07 from "./schema-draft-07/index.js";

export class SchemaManager {

    private readonly rootNodeMetaMap = new Map<string, MetaSchemaKey>();
    private readonly nodeMetaMap = new Map<string, MetaSchemaKey>();
    private readonly nameMap = new Map<string, string>();
    private readonly retrievalSet = new Set<string>();

    private readonly loaders = {
        [schema202012.metaSchema.metaSchemaKey]: new schema202012.SchemaLoader(this),
        [schema201909.metaSchema.metaSchemaKey]: new schema201909.SchemaLoader(this),
        [schemaDraft07.metaSchema.metaSchemaKey]: new schemaDraft07.SchemaLoader(this),
        [schemaDraft06.metaSchema.metaSchemaKey]: new schemaDraft06.SchemaLoader(this),
        [schemaDraft04.metaSchema.metaSchemaKey]: new schemaDraft04.SchemaLoader(this),
    };

    private readonly indexers = {
        [schema202012.metaSchema.metaSchemaKey]: new schema202012.SchemaIndexer(
            this,
            this.loaders[schema202012.metaSchema.metaSchemaKey],
        ),
        [schema201909.metaSchema.metaSchemaKey]: new schema201909.SchemaIndexer(
            this,
            this.loaders[schema201909.metaSchema.metaSchemaKey],
        ),
        [schemaDraft07.metaSchema.metaSchemaKey]: new schemaDraft07.SchemaIndexer(
            this,
            this.loaders[schemaDraft07.metaSchema.metaSchemaKey],
        ),
        [schemaDraft06.metaSchema.metaSchemaKey]: new schemaDraft06.SchemaIndexer(
            this,
            this.loaders[schemaDraft06.metaSchema.metaSchemaKey],
        ),
        [schemaDraft04.metaSchema.metaSchemaKey]: new schemaDraft04.SchemaIndexer(
            this,
            this.loaders[schemaDraft04.metaSchema.metaSchemaKey],
        ),
    };

    private readonly namers = {
        [schema202012.metaSchema.metaSchemaKey]: new schema202012.SchemaNamer(
            this,
            this.indexers[schema202012.metaSchema.metaSchemaKey],
        ),
        [schema201909.metaSchema.metaSchemaKey]: new schema201909.SchemaNamer(
            this,
            this.indexers[schema201909.metaSchema.metaSchemaKey],
        ),
        [schemaDraft07.metaSchema.metaSchemaKey]: new schemaDraft07.SchemaNamer(
            this,
            this.indexers[schemaDraft07.metaSchema.metaSchemaKey],
        ),
        [schemaDraft06.metaSchema.metaSchemaKey]: new schemaDraft06.SchemaNamer(
            this,
            this.indexers[schemaDraft06.metaSchema.metaSchemaKey],
        ),
        [schemaDraft04.metaSchema.metaSchemaKey]: new schemaDraft04.SchemaNamer(
            this,
            this.indexers[schemaDraft04.metaSchema.metaSchemaKey],
        ),
    };

    private readonly codeGenerators = {
        [schema202012.metaSchema.metaSchemaKey]: new schema202012.SchemaCodeGenerator(
            this,
            this.loaders[schema202012.metaSchema.metaSchemaKey],
            this.indexers[schema202012.metaSchema.metaSchemaKey],
        ),
        [schema201909.metaSchema.metaSchemaKey]: new schema201909.SchemaCodeGenerator(
            this,
            this.loaders[schema201909.metaSchema.metaSchemaKey],
            this.indexers[schema201909.metaSchema.metaSchemaKey],
        ),
        [schemaDraft07.metaSchema.metaSchemaKey]: new schemaDraft07.SchemaCodeGenerator(
            this,
            this.loaders[schemaDraft07.metaSchema.metaSchemaKey],
            this.indexers[schemaDraft07.metaSchema.metaSchemaKey],
        ),
        [schemaDraft06.metaSchema.metaSchemaKey]: new schemaDraft06.SchemaCodeGenerator(
            this,
            this.loaders[schemaDraft06.metaSchema.metaSchemaKey],
            this.indexers[schemaDraft06.metaSchema.metaSchemaKey],
        ),
        [schemaDraft04.metaSchema.metaSchemaKey]: new schemaDraft04.SchemaCodeGenerator(
            this,
            this.loaders[schemaDraft04.metaSchema.metaSchemaKey],
            this.indexers[schemaDraft04.metaSchema.metaSchemaKey],
        ),
    };

    public registerRootNodeMetaSchema(
        nodeId: string,
        schemaMetaKey: MetaSchemaKey,
    ) {
        if (this.rootNodeMetaMap.has(nodeId)) {
            throw new Error("duplicate root nodeId");
        }
        this.rootNodeMetaMap.set(nodeId, schemaMetaKey);
    }

    public registerNodeMetaSchema(
        nodeId: string,
        schemaMetaKey: MetaSchemaKey,
    ) {
        if (this.nodeMetaMap.has(nodeId)) {
            throw new Error("duplicate nodeId");
        }
        this.nodeMetaMap.set(nodeId, schemaMetaKey);
    }

    public async loadFromUrl(
        nodeUrl: URL,
        retrievalUrl: URL,
        referencingUrl: URL | null,
        defaultMetaSchemaKey: MetaSchemaKey,
    ) {
        const retrievalId = String(retrievalUrl);
        if (this.retrievalSet.has(retrievalId)) {
            return;
        }
        this.retrievalSet.add(retrievalId);

        const schemaRootNode = await this.loadSchemaRootNodeFromUrl(
            retrievalUrl,
        );

        await this.loadFromRootNode(
            schemaRootNode,
            nodeUrl,
            retrievalUrl,
            referencingUrl,
            defaultMetaSchemaKey,
        );

    }

    private async loadSchemaRootNodeFromUrl(
        url: URL,
    ) {
        switch (url.protocol) {
            case "http:":
            case "http2:": {
                const result = await fetch(url);
                const schemaRootNode = await result.json() as unknown;

                return schemaRootNode;
            }

            case "file:": {
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                const content = fs.readFileSync(url.pathname, "utf-8");

                const schemaRootNode = JSON.parse(content) as unknown;

                return schemaRootNode;
            }
        }
    }

    public async loadFromRootNode(
        node: unknown,
        nodeUrl: URL,
        retrievalUrl: URL,
        referencingNodeUrl: URL | null,
        defaultMetaSchemaKey: MetaSchemaKey,
    ) {
        const rootNodeSchemaMetaKey = discoverRootNodeMetaSchemaKey(node) ??
            defaultMetaSchemaKey;

        // eslint-disable-next-line security/detect-object-injection
        const loader = this.loaders[rootNodeSchemaMetaKey];
        await loader.loadFromRootNode(
            node,
            nodeUrl,
            retrievalUrl,
            referencingNodeUrl,
        );
    }

    public async indexNodes(
    ) {
        for (const indexer of Object.values(this.indexers)) {
            indexer.indexNodes();
        }
    }

    public nameNodes() {
        for (const [rootNodeId, metaSchemaKey] of this.rootNodeMetaMap) {
            const namer = this.namers[metaSchemaKey as keyof typeof this.namers];
            for (const [nodeId, name] of namer.getTypeNames(rootNodeId)) {
                if (this.nameMap.has(nodeId)) {
                    throw new Error("duplicate nodeId");
                }
                this.nameMap.set(nodeId, name);
            }
        }
    }

    public getName(nodeId: string) {
        return this.nameMap.get(nodeId);
    }

    public *generateStatements(
        factory: ts.NodeFactory,
    ) {
        for (const [nodeId, metaSchemaKey] of this.nodeMetaMap) {
            const codeGenerator =
                this.codeGenerators[metaSchemaKey as keyof typeof this.codeGenerators];
            yield* codeGenerator.generateStatements(
                factory,
                nodeId,
            );
        }

    }

}
