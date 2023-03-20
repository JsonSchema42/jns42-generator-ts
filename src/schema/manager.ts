import ts from "typescript";
import { discoverRootNodeMetaSchemaKey, MetaSchemaKey } from "./meta.js";
import * as schema201909 from "./schema-2019-09/index.js";
import * as schema202012 from "./schema-2020-12/index.js";
import * as schemaDraft04 from "./schema-draft-04/index.js";
import * as schemaDraft07 from "./schema-draft-06/index.js";
import * as schemaDraft06 from "./schema-draft-07/index.js";

export class SchemaManager {

    private readonly rootNodeMetaMap = new Map<string, MetaSchemaKey>();
    private readonly nodeMetaMap = new Map<string, MetaSchemaKey>();
    private readonly nameMap = new Map<string, string>();

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
    };

    private readonly namers = {
        [schema202012.metaSchema.metaSchemaKey]: new schema202012.SchemaNamer(
            this,
            this.indexers[schema202012.metaSchema.metaSchemaKey],
        ),
    };

    private readonly codeGenerators = {
        [schema202012.metaSchema.metaSchemaKey]: new schema202012.SchemaCodeGenerator(
            this,
            this.loaders[schema202012.metaSchema.metaSchemaKey],
            this.indexers[schema202012.metaSchema.metaSchemaKey],
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

    public async loadFromURL(
        url: URL,
        referencingUrl: URL | null,
        defaultMetaSchemaKey: MetaSchemaKey,
    ) {
        const result = await fetch(url);
        const schemaRootNode = await result.json() as unknown;

        await this.loadFromRootNode(
            schemaRootNode,
            url,
            referencingUrl,
            defaultMetaSchemaKey,
        );
    }

    public async loadFromRootNode(
        node: unknown,
        nodeUrl: URL,
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
