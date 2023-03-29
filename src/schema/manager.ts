import camelcase from "camelcase";
import * as fs from "fs";
import ts from "typescript";
import { Namer } from "../utils/namer.js";
import * as schemaDraft04 from "./draft-04/index.js";
import * as schemaDraft06 from "./draft-06/index.js";
import * as schemaDraft07 from "./draft-07/index.js";
import * as schema201909 from "./draft-2019-09/index.js";
import * as schema202012 from "./draft-2020-12/index.js";
import { SchemaIndexerBase } from "./indexer.js";
import { SchemaLoaderBase } from "./loader.js";
import { discoverRootNodeMetaSchemaId, MetaSchemaId } from "./meta.js";

export class SchemaManager {

    constructor(
        private readonly namer: Namer,
    ) {
        //
    }

    private readonly rootNodeMetaMap = new Map<string, MetaSchemaId>();
    private readonly nodeMetaMap = new Map<string, MetaSchemaId>();
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

        const loader: SchemaLoaderBase<unknown> = this.loaders[rootNodeSchemaMetaKey];

        if (!loader.validateSchema(node)) {
            throw new Error("invalid schema");
        }
        /*
        typescript breaks here so we cast to any
        */
        return await loader.loadFromRootNode(
            node,
            nodeUrl,
            retrievalUrl,
            referencingNodeUrl,
            (nodeId: string, metaSchemaId: MetaSchemaId) => {
                if (this.rootNodeMetaMap.has(nodeId)) {
                    throw new Error("duplicate root nodeId");
                }
                this.rootNodeMetaMap.set(nodeId, metaSchemaId);
            },
        );

    }

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

        const schemaRootNode = await this.fetchSchemaRootNodeFromUrl(
            retrievalUrl,
        );

        rootNodeUrl = await this.loadFromRootNode(
            schemaRootNode,
            nodeUrl,
            retrievalUrl,
            referencingUrl,
            defaultMetaSchemaId,
        );

        const rootNodeId = String(rootNodeUrl);

        this.retrievalRootNodeMap.set(retrievalId, rootNodeUrl);
        this.rootNodeRetrievalMap.set(rootNodeId, retrievalUrl);

        return rootNodeUrl;
    }

    private async fetchSchemaRootNodeFromUrl(
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
            for (const [nodeId, name] of this.getTypeNames(metaSchemaId, rootNodeId)) {
                this.namer.registerName(nodeId, name);
            }
        }
    }

    public getName(nodeId: string) {
        if (!this.initialized) {
            throw new Error("not yet initialized");
        }

        const name = this.namer.getName(nodeId);

        return name.join("_");
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

    private * getTypeNames(
        metaSchemaId: MetaSchemaId,
        nodeId: string,
        baseName = "",
    ): Iterable<readonly [string, string]> {
        const reReplace = /[^A-Za-z0-9]/gu;
        const reFilter = /^[A-Za-z]/u;

        const indexer: SchemaIndexerBase<unknown> = this.indexers[metaSchemaId];

        const item = indexer.getNodeItem(nodeId);

        const {
            node,
            nodeRootUrl,
            nodePointer,
        } = item;

        const pathParts = nodeRootUrl.pathname.
            split("/").
            map(decodeURI).
            map(value => value.toLowerCase()).
            map(value => value.replace(reReplace, "")).
            filter(value => reFilter.test(value));
        const pointerParts = nodePointer.
            split("/").
            map(decodeURI).
            map(value => value.toLowerCase()).
            map(value => value.replace(reReplace, ""));

        if (nodePointer === "") {
            baseName = pathParts[pathParts.length - 1] ?? "Schema";
        }

        const nameParts = [
            baseName,
            pointerParts[pointerParts.length - 1],
        ].
            filter(value => value != null).
            filter(value => value != "");

        const name = camelcase(nameParts, { pascalCase: true });

        yield [nodeId, name] as const;

        for (
            const [subNodePointer] of
            /*
            ye typescript breaks here
            */
            indexer.selectSubNodeEntries(nodePointer, node)
        ) {
            const subNodeUrl = new URL(`#${subNodePointer}`, nodeRootUrl);
            const subNodeId = String(subNodeUrl);
            yield* this.getTypeNames(
                metaSchemaId,
                subNodeId,
                name,
            );
        }

    }

}
