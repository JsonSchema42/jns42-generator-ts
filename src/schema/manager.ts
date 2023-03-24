import * as fs from "fs";
import ts from "typescript";
import { discoverRootNodeMetaSchemaId, MetaSchemaId } from "./meta.js";
import * as schema201909 from "./schema-2019-09/index.js";
import * as schema202012 from "./schema-2020-12/index.js";
import * as schemaDraft04 from "./schema-draft-04/index.js";
import * as schemaDraft06 from "./schema-draft-06/index.js";
import * as schemaDraft07 from "./schema-draft-07/index.js";

export class SchemaManager {

    private readonly rootNodeMetaMap = new Map<string, MetaSchemaId>();
    private readonly nodeMetaMap = new Map<string, MetaSchemaId>();
    private readonly nameMap = new Map<string, string>();
    private readonly retrievalRootNodeMap = new Map<string, URL>();

    private readonly loaders = {
        [schema202012.metaSchema.metaSchemaId]: new schema202012.SchemaLoader(this),
        [schema201909.metaSchema.metaSchemaId]: new schema201909.SchemaLoader(this),
        [schemaDraft07.metaSchema.metaSchemaId]: new schemaDraft07.SchemaLoader(this),
        [schemaDraft06.metaSchema.metaSchemaId]: new schemaDraft06.SchemaLoader(this),
        [schemaDraft04.metaSchema.metaSchemaId]: new schemaDraft04.SchemaLoader(this),
    };

    private readonly indexers = {
        [schema202012.metaSchema.metaSchemaId]: new schema202012.SchemaIndexer(
            this,
            this.loaders[schema202012.metaSchema.metaSchemaId],
        ),
        [schema201909.metaSchema.metaSchemaId]: new schema201909.SchemaIndexer(
            this,
            this.loaders[schema201909.metaSchema.metaSchemaId],
        ),
        [schemaDraft07.metaSchema.metaSchemaId]: new schemaDraft07.SchemaIndexer(
            this,
            this.loaders[schemaDraft07.metaSchema.metaSchemaId],
        ),
        [schemaDraft06.metaSchema.metaSchemaId]: new schemaDraft06.SchemaIndexer(
            this,
            this.loaders[schemaDraft06.metaSchema.metaSchemaId],
        ),
        [schemaDraft04.metaSchema.metaSchemaId]: new schemaDraft04.SchemaIndexer(
            this,
            this.loaders[schemaDraft04.metaSchema.metaSchemaId],
        ),
    };

    private readonly namers = {
        [schema202012.metaSchema.metaSchemaId]: new schema202012.SchemaNamer(
            this,
            this.indexers[schema202012.metaSchema.metaSchemaId],
        ),
        [schema201909.metaSchema.metaSchemaId]: new schema201909.SchemaNamer(
            this,
            this.indexers[schema201909.metaSchema.metaSchemaId],
        ),
        [schemaDraft07.metaSchema.metaSchemaId]: new schemaDraft07.SchemaNamer(
            this,
            this.indexers[schemaDraft07.metaSchema.metaSchemaId],
        ),
        [schemaDraft06.metaSchema.metaSchemaId]: new schemaDraft06.SchemaNamer(
            this,
            this.indexers[schemaDraft06.metaSchema.metaSchemaId],
        ),
        [schemaDraft04.metaSchema.metaSchemaId]: new schemaDraft04.SchemaNamer(
            this,
            this.indexers[schemaDraft04.metaSchema.metaSchemaId],
        ),
    };

    private readonly codeGenerators = {
        [schema202012.metaSchema.metaSchemaId]: new schema202012.SchemaCodeGenerator(
            this,
            this.loaders[schema202012.metaSchema.metaSchemaId],
            this.indexers[schema202012.metaSchema.metaSchemaId],
        ),
        [schema201909.metaSchema.metaSchemaId]: new schema201909.SchemaCodeGenerator(
            this,
            this.loaders[schema201909.metaSchema.metaSchemaId],
            this.indexers[schema201909.metaSchema.metaSchemaId],
        ),
        [schemaDraft07.metaSchema.metaSchemaId]: new schemaDraft07.SchemaCodeGenerator(
            this,
            this.loaders[schemaDraft07.metaSchema.metaSchemaId],
            this.indexers[schemaDraft07.metaSchema.metaSchemaId],
        ),
        [schemaDraft06.metaSchema.metaSchemaId]: new schemaDraft06.SchemaCodeGenerator(
            this,
            this.loaders[schemaDraft06.metaSchema.metaSchemaId],
            this.indexers[schemaDraft06.metaSchema.metaSchemaId],
        ),
        [schemaDraft04.metaSchema.metaSchemaId]: new schemaDraft04.SchemaCodeGenerator(
            this,
            this.loaders[schemaDraft04.metaSchema.metaSchemaId],
            this.indexers[schemaDraft04.metaSchema.metaSchemaId],
        ),
    };

    private readonly exampleGenerators = {
        [schema202012.metaSchema.metaSchemaId]: new schema202012.SchemaExampleGenerator(
            this,
            this.loaders[schema202012.metaSchema.metaSchemaId],
            this.indexers[schema202012.metaSchema.metaSchemaId],
        ),
        [schema201909.metaSchema.metaSchemaId]: new schema201909.SchemaExampleGenerator(
            this,
            this.loaders[schema201909.metaSchema.metaSchemaId],
            this.indexers[schema201909.metaSchema.metaSchemaId],
        ),
        [schemaDraft07.metaSchema.metaSchemaId]: new schemaDraft07.SchemaExampleGenerator(
            this,
            this.loaders[schemaDraft07.metaSchema.metaSchemaId],
            this.indexers[schemaDraft07.metaSchema.metaSchemaId],
        ),
        [schemaDraft06.metaSchema.metaSchemaId]: new schemaDraft06.SchemaExampleGenerator(
            this,
            this.loaders[schemaDraft06.metaSchema.metaSchemaId],
            this.indexers[schemaDraft06.metaSchema.metaSchemaId],
        ),
        [schemaDraft04.metaSchema.metaSchemaId]: new schemaDraft04.SchemaExampleGenerator(
            this,
            this.loaders[schemaDraft04.metaSchema.metaSchemaId],
            this.indexers[schemaDraft04.metaSchema.metaSchemaId],
        ),
    };

    public registerRootNodeMetaSchema(
        nodeId: string,
        schemaMetaKey: MetaSchemaId,
    ) {
        if (this.rootNodeMetaMap.has(nodeId)) {
            throw new Error("duplicate root nodeId");
        }
        this.rootNodeMetaMap.set(nodeId, schemaMetaKey);
    }

    public registerNodeMetaSchema(
        nodeId: string,
        schemaMetaKey: MetaSchemaId,
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
        defaultMetaSchemaId: MetaSchemaId,
    ) {
        const retrievalId = String(retrievalUrl);

        let rootNodeUrl = this.retrievalRootNodeMap.get(retrievalId);
        if (rootNodeUrl != null) {
            return rootNodeUrl;
        }

        const schemaRootNode = await this.loadSchemaRootNodeFromUrl(
            retrievalUrl,
        );

        rootNodeUrl = await this.loadFromRootNode(
            schemaRootNode,
            nodeUrl,
            retrievalUrl,
            referencingUrl,
            defaultMetaSchemaId,
        );

        if (rootNodeUrl == null) {
            throw new Error("rootNode not found");
        }

        this.retrievalRootNodeMap.set(retrievalId, rootNodeUrl);

        return rootNodeUrl;
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
        defaultMetaSchemaId: MetaSchemaId,
    ) {
        const rootNodeSchemaMetaKey = discoverRootNodeMetaSchemaId(node) ??
            defaultMetaSchemaId;

        // eslint-disable-next-line security/detect-object-injection
        const loader = this.loaders[rootNodeSchemaMetaKey];
        return await loader.loadFromRootNode(
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
        for (const [rootNodeId, metaSchemaId] of this.rootNodeMetaMap) {
            const namer = this.namers[metaSchemaId as keyof typeof this.namers];
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
        for (const [nodeId, metaSchemaId] of this.nodeMetaMap) {
            // eslint-disable-next-line security/detect-object-injection
            const codeGenerator = this.codeGenerators[metaSchemaId];
            yield* codeGenerator.generateStatements(
                factory,
                nodeId,
            );
        }

    }

    public *generateValidExamples(nodeUrl: URL) {
        const nodeId = String(nodeUrl);
        const metaSchemaId = this.nodeMetaMap.get(nodeId);
        if (metaSchemaId == null) {
            throw new Error("node nopt found");

        }

        // eslint-disable-next-line security/detect-object-injection
        const exampleGenerator = this.exampleGenerators[metaSchemaId];
        yield* exampleGenerator.generateValidExamples(nodeUrl);
    }

}
