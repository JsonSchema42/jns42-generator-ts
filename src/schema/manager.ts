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
    private readonly rootNodeRetrievalMap = new Map<string, URL>();

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

    private readonly typeCodeGenerators = {
        [schema202012.metaSchema.metaSchemaId]: new schema202012.SchemaTypeCodeGenerator(
            this,
            this.indexers[schema202012.metaSchema.metaSchemaId],
        ),
        [schema201909.metaSchema.metaSchemaId]: new schema201909.SchemaTypeCodeGenerator(
            this,
            this.indexers[schema201909.metaSchema.metaSchemaId],
        ),
        [schemaDraft07.metaSchema.metaSchemaId]: new schemaDraft07.SchemaTypeCodeGenerator(
            this,
            this.indexers[schemaDraft07.metaSchema.metaSchemaId],
        ),
        [schemaDraft06.metaSchema.metaSchemaId]: new schemaDraft06.SchemaTypeCodeGenerator(
            this,
            this.indexers[schemaDraft06.metaSchema.metaSchemaId],
        ),
        [schemaDraft04.metaSchema.metaSchemaId]: new schemaDraft04.SchemaTypeCodeGenerator(
            this,
            this.indexers[schemaDraft04.metaSchema.metaSchemaId],
        ),
    };

    private readonly validatorCodeGenerators = {
        [schema202012.metaSchema.metaSchemaId]: new schema202012.SchemaValidatorCodeGenerator(
            this,
            this.indexers[schema202012.metaSchema.metaSchemaId],
        ),
        [schema201909.metaSchema.metaSchemaId]: new schema201909.SchemaValidatorCodeGenerator(
            this,
            this.indexers[schema201909.metaSchema.metaSchemaId],
        ),
        [schemaDraft07.metaSchema.metaSchemaId]: new schemaDraft07.SchemaValidatorCodeGenerator(
            this,
            this.indexers[schemaDraft07.metaSchema.metaSchemaId],
        ),
        [schemaDraft06.metaSchema.metaSchemaId]: new schemaDraft06.SchemaValidatorCodeGenerator(
            this,
            this.indexers[schemaDraft06.metaSchema.metaSchemaId],
        ),
        [schemaDraft04.metaSchema.metaSchemaId]: new schemaDraft04.SchemaValidatorCodeGenerator(
            this,
            this.indexers[schemaDraft04.metaSchema.metaSchemaId],
        ),
    };

    private readonly specCodeGenerators = {
        [schema202012.metaSchema.metaSchemaId]: new schema202012.SchemaSpecCodeGenerator(
            this,
        ),
        [schema201909.metaSchema.metaSchemaId]: new schema201909.SchemaSpecCodeGenerator(
            this,
        ),
        [schemaDraft07.metaSchema.metaSchemaId]: new schemaDraft07.SchemaSpecCodeGenerator(
            this,
        ),
        [schemaDraft06.metaSchema.metaSchemaId]: new schemaDraft06.SchemaSpecCodeGenerator(
            this,
        ),
        [schemaDraft04.metaSchema.metaSchemaId]: new schemaDraft04.SchemaSpecCodeGenerator(
            this,
        ),
    };

    private readonly exampleGenerators = {
        [schema202012.metaSchema.metaSchemaId]: new schema202012.SchemaExampleGenerator(
            this,
            this.indexers[schema202012.metaSchema.metaSchemaId],
        ),
        [schema201909.metaSchema.metaSchemaId]: new schema201909.SchemaExampleGenerator(
            this,
            this.indexers[schema201909.metaSchema.metaSchemaId],
        ),
        [schemaDraft07.metaSchema.metaSchemaId]: new schemaDraft07.SchemaExampleGenerator(
            this,
            this.indexers[schemaDraft07.metaSchema.metaSchemaId],
        ),
        [schemaDraft06.metaSchema.metaSchemaId]: new schemaDraft06.SchemaExampleGenerator(
            this,
            this.indexers[schemaDraft06.metaSchema.metaSchemaId],
        ),
        [schemaDraft04.metaSchema.metaSchemaId]: new schemaDraft04.SchemaExampleGenerator(
            this,
            this.indexers[schemaDraft04.metaSchema.metaSchemaId],
        ),
    };

    public async loadFromUrl(
        nodeUrl: URL,
        retrievalUrl: URL,
        referencingUrl: URL | null,
        defaultMetaSchemaId: MetaSchemaId,
    ) {
        if (this.initialized) {
            throw new Error("cannot load after initialized");
        }

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

        const rootNodeId = String(rootNodeUrl);

        this.retrievalRootNodeMap.set(retrievalId, rootNodeUrl);
        this.rootNodeRetrievalMap.set(rootNodeId, retrievalUrl);

        return rootNodeUrl;
    }

    private async loadSchemaRootNodeFromUrl(
        url: URL,
    ) {
        if (this.initialized) {
            throw new Error("cannot load after initialized");
        }

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
        if (this.initialized) {
            throw new Error("cannot load after initialized");
        }

        const rootNodeSchemaMetaKey = discoverRootNodeMetaSchemaId(node) ??
            defaultMetaSchemaId;

        const loader = this.loaders[rootNodeSchemaMetaKey];
        return await loader.loadFromRootNode(
            node,
            nodeUrl,
            retrievalUrl,
            referencingNodeUrl,
            (nodeId, metaSchemaId) => {
                if (this.rootNodeMetaMap.has(nodeId)) {
                    throw new Error("duplicate root nodeId");
                }
                this.rootNodeMetaMap.set(nodeId, metaSchemaId);

            },
        );

    }

    private initialized = false;
    public async initialize() {
        if (this.initialized) {
            throw new Error("already initialized");
        }
        this.initialized = true;

        for (const indexer of Object.values(this.indexers)) {
            indexer.indexNodes(
                (nodeId, metaSchemaId) => {
                    if (this.nodeMetaMap.has(nodeId)) {
                        throw new Error("duplicate nodeId");
                    }
                    this.nodeMetaMap.set(nodeId, metaSchemaId);
                },
            );
        }

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
        if (!this.initialized) {
            throw new Error("not yet initialized");
        }

        return this.nameMap.get(nodeId);
    }

    public getNodeRetrievalUrl(nodeRootId: string) {
        if (!this.initialized) {
            throw new Error("not yet initialized");
        }

        return this.rootNodeRetrievalMap.get(nodeRootId);
    }

    public getNodeRootUrl(nodeRetrievalId: string) {
        if (!this.initialized) {
            throw new Error("not yet initialized");
        }

        return this.retrievalRootNodeMap.get(nodeRetrievalId);
    }

    public *generateTypeStatements(
        factory: ts.NodeFactory,
    ) {
        for (const [nodeId, metaSchemaId] of this.nodeMetaMap) {

            const codeGenerator = this.typeCodeGenerators[metaSchemaId];
            yield* codeGenerator.generateStatements(
                factory,
                nodeId,
            );
        }

    }

    public *generateValidatorStatements(
        factory: ts.NodeFactory,
    ) {
        if (!this.initialized) {
            throw new Error("not yet initialized");
        }

        yield factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
                false,
                undefined,
                factory.createNamespaceImport(factory.createIdentifier("validation")),
            ),
            factory.createStringLiteral("./validation.js"),
        );

        yield factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
                false,
                undefined,
                factory.createNamespaceImport(factory.createIdentifier("types")),
            ),
            factory.createStringLiteral("./types.js"),
        );

        for (const [nodeId, metaSchemaId] of this.nodeMetaMap) {

            const codeGenerator = this.validatorCodeGenerators[metaSchemaId];
            yield* codeGenerator.generateStatements(
                factory,
                nodeId,
            );
        }
    }

    public *generateSpecStatements(
        factory: ts.NodeFactory,
        nodeUrl: URL,
    ) {
        if (!this.initialized) {
            throw new Error("not yet initialized");
        }

        const nodeId = String(nodeUrl);

        yield factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
                false,
                undefined,
                factory.createNamespaceImport(factory.createIdentifier("types")),
            ),
            factory.createStringLiteral("./types.js"),
        );
        yield factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
                false,
                undefined,
                factory.createNamespaceImport(factory.createIdentifier("validators")),
            ),
            factory.createStringLiteral("./validators.js"),
        );

        yield factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
                false,
                factory.createIdentifier("assert"),
                undefined,
            ),
            factory.createStringLiteral("node:assert"),
            undefined,
        );
        yield factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
                false,
                factory.createIdentifier("fs"),
                undefined,
            ),
            factory.createStringLiteral("node:fs"),
            undefined,
        );
        yield factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
                false,
                undefined,
                factory.createNamespaceImport(factory.createIdentifier("path")),
            ),
            factory.createStringLiteral("node:path"),
            undefined,
        );
        yield factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
                false,
                factory.createIdentifier("test"),
                undefined,
            ),
            factory.createStringLiteral("node:test"),
            undefined,
        );

        {
            const metaSchemaId = this.nodeMetaMap.get(nodeId);
            if (metaSchemaId == null) {
                throw new Error("node not found");
            }

            const codeGenerator = this.specCodeGenerators[metaSchemaId];
            yield* codeGenerator.generateStatements(
                factory,
                nodeId,
            );
        }

    }

    public generateExamples(nodeId: string) {
        if (!this.initialized) {
            throw new Error("not yet initialized");
        }

        const metaSchemaId = this.nodeMetaMap.get(nodeId);
        if (metaSchemaId == null) {
            throw new Error("node not found");
        }

        const exampleGenerator = this.exampleGenerators[metaSchemaId];
        return exampleGenerator.generateFromNode(nodeId);
    }

    public *generateValidExamples(nodeUrl: URL) {
        if (!this.initialized) {
            throw new Error("not yet initialized");
        }

        const nodeId = String(nodeUrl);
        for (const [error, example] of this.generateExamples(nodeId)) {
            if (error > 0) {
                continue;
            }
            yield example;
        }
    }

    public *generateInvalidExamples(nodeUrl: URL) {
        if (!this.initialized) {
            throw new Error("not yet initialized");
        }

        const nodeId = String(nodeUrl);
        for (const [error, example] of this.generateExamples(nodeId)) {
            if (error !== 1) {
                continue;
            }
            yield example;
        }
    }

}
