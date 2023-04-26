import camelcase from "camelcase";
import * as fs from "fs";
import ts from "typescript";
import { Namer } from "../utils/index.js";
import * as schemaDraft04 from "./draft-04/index.js";
import * as schemaDraft06 from "./draft-06/index.js";
import * as schemaDraft07 from "./draft-07/index.js";
import * as schema201909 from "./draft-2019-09/index.js";
import * as schema202012 from "./draft-2020-12/index.js";
import { LoaderStrategy, SchemaLoaderBase } from "./loader.js";
import { MetaSchemaId } from "./meta.js";
import { TypeDescriptorUnion } from "./type-descriptors.js";

export class SchemaManager implements LoaderStrategy {

    private readonly rootNodeMetaMap = new Map<string, MetaSchemaId>();
    private readonly nodeMetaMap = new Map<string, MetaSchemaId>();
    private readonly retrievalRootNodeMap = new Map<string, URL>();
    private readonly rootNodeRetrievalMap = new Map<string, URL>();

    private readonly loaders = {
        [schema202012.metaSchemaId]: new schema202012.SchemaLoader(this),
        [schema201909.metaSchemaId]: new schema201909.SchemaLoader(this),
        [schemaDraft07.metaSchemaId]: new schemaDraft07.SchemaLoader(this),
        [schemaDraft06.metaSchemaId]: new schemaDraft06.SchemaLoader(this),
        [schemaDraft04.metaSchemaId]: new schemaDraft04.SchemaLoader(this),
    };

    private readonly typeCodeGenerators = {
        [schema202012.metaSchemaId]: new schema202012.SchemaTypeCodeGenerator(
            this,
            this.loaders[schema202012.metaSchemaId],
        ),
        [schema201909.metaSchemaId]: new schema201909.SchemaTypeCodeGenerator(
            this,
            this.loaders[schema201909.metaSchemaId],
        ),
        [schemaDraft07.metaSchemaId]: new schemaDraft07.SchemaTypeCodeGenerator(
            this,
            this.loaders[schemaDraft07.metaSchemaId],
        ),
        [schemaDraft06.metaSchemaId]: new schemaDraft06.SchemaTypeCodeGenerator(
            this,
            this.loaders[schemaDraft06.metaSchemaId],
        ),
        [schemaDraft04.metaSchemaId]: new schemaDraft04.SchemaTypeCodeGenerator(
            this,
            this.loaders[schemaDraft04.metaSchemaId],
        ),
    };

    private readonly validatorCodeGenerators = {
        [schema202012.metaSchemaId]: new schema202012.SchemaValidatorCodeGenerator(
            this,
            this.loaders[schema202012.metaSchemaId],
        ),
        [schema201909.metaSchemaId]: new schema201909.SchemaValidatorCodeGenerator(
            this,
            this.loaders[schema201909.metaSchemaId],
        ),
        [schemaDraft07.metaSchemaId]: new schemaDraft07.SchemaValidatorCodeGenerator(
            this,
            this.loaders[schemaDraft07.metaSchemaId],
        ),
        [schemaDraft06.metaSchemaId]: new schemaDraft06.SchemaValidatorCodeGenerator(
            this,
            this.loaders[schemaDraft06.metaSchemaId],
        ),
        [schemaDraft04.metaSchemaId]: new schemaDraft04.SchemaValidatorCodeGenerator(
            this,
            this.loaders[schemaDraft04.metaSchemaId],
        ),
    };

    private readonly specCodeGenerators = {
        [schema202012.metaSchemaId]: new schema202012.SchemaSpecCodeGenerator(
            this,
        ),
        [schema201909.metaSchemaId]: new schema201909.SchemaSpecCodeGenerator(
            this,
        ),
        [schemaDraft07.metaSchemaId]: new schemaDraft07.SchemaSpecCodeGenerator(
            this,
        ),
        [schemaDraft06.metaSchemaId]: new schemaDraft06.SchemaSpecCodeGenerator(
            this,
        ),
        [schemaDraft04.metaSchemaId]: new schemaDraft04.SchemaSpecCodeGenerator(
            this,
        ),
    };

    private readonly exampleGenerators = {
        [schema202012.metaSchemaId]: new schema202012.SchemaExampleGenerator(
            this,
            this.loaders[schema202012.metaSchemaId],
        ),
        [schema201909.metaSchemaId]: new schema201909.SchemaExampleGenerator(
            this,
            this.loaders[schema201909.metaSchemaId],
        ),
        [schemaDraft07.metaSchemaId]: new schemaDraft07.SchemaExampleGenerator(
            this,
            this.loaders[schemaDraft07.metaSchemaId],
        ),
        [schemaDraft06.metaSchemaId]: new schemaDraft06.SchemaExampleGenerator(
            this,
            this.loaders[schemaDraft06.metaSchemaId],
        ),
        [schemaDraft04.metaSchemaId]: new schemaDraft04.SchemaExampleGenerator(
            this,
            this.loaders[schemaDraft04.metaSchemaId],
        ),
    };

    public async loadRootNode(
        rootNode: unknown,
        rootNodeUrl: URL,
        referencingNodeUrl: URL | null,
        defaultMetaSchemaId: MetaSchemaId,
    ) {
        const metaSchemaId = this.discoverMetaSchemaId(rootNode) ??
            defaultMetaSchemaId;

        const loader: SchemaLoaderBase<unknown> = this.loaders[metaSchemaId];

        await loader.loadRootNode(
            rootNode,
            rootNodeUrl,
            referencingNodeUrl,
        );

        for (const nodeUrl of loader.indexRootNode(rootNodeUrl)) {
            const nodeId = String(nodeUrl);
            this.nodeMetaMap.set(nodeId, metaSchemaId);
        }

    }

    public async loadFromUrl(
        rootNodeUrl: URL,
        retrievalUrl: URL,
        referencingUrl: URL | null,
        defaultMetaSchemaId: MetaSchemaId,
    ) {
        const retrievalId = String(retrievalUrl);

        const maybeRootNodeUrl = this.retrievalRootNodeMap.get(retrievalId);
        if (maybeRootNodeUrl != null) {
            return maybeRootNodeUrl;
        }

        const rootNode = await this.fetchJsonFromUrl(
            retrievalUrl,
        );

        const metaSchemaId = this.discoverMetaSchemaId(rootNode) ?? defaultMetaSchemaId;

        const loader: SchemaLoaderBase<unknown> = this.loaders[metaSchemaId];

        if (!loader.validateSchema(rootNode)) {
            throw new Error("invalid schema");
        }

        rootNodeUrl = loader.selectNodeUrl(rootNode) ?? rootNodeUrl;

        const rootNodeId = String(rootNodeUrl);

        this.retrievalRootNodeMap.set(retrievalId, rootNodeUrl);
        this.rootNodeRetrievalMap.set(rootNodeId, retrievalUrl);
        this.rootNodeMetaMap.set(rootNodeId, metaSchemaId);

        for (
            const [subNodeUrl, subRetrievalUrl] of
            loader.getReferencedNodeUrls(rootNode, rootNodeUrl, retrievalUrl)
        ) {
            await this.loadFromUrl(subNodeUrl, subRetrievalUrl, rootNodeUrl, metaSchemaId);
        }

        await this.loadRootNode(
            rootNode,
            rootNodeUrl,
            referencingUrl,
            defaultMetaSchemaId,
        );

        return rootNodeUrl;
    }

    private async fetchJsonFromUrl(
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

    private discoverMetaSchemaId(
        node: unknown,
    ) {
        for (const [metaSchemaId, loader] of Object.entries(this.loaders)) {
            if (loader.isSchemaRootNode(node)) {
                return metaSchemaId as MetaSchemaId;
            }
        }
    }

    public getNodeRetrievalUrl(nodeRootId: string) {
        return this.rootNodeRetrievalMap.get(nodeRootId);
    }

    public getNodeRootUrl(nodeRetrievalId: string) {
        return this.retrievalRootNodeMap.get(nodeRetrievalId);
    }

    /**
     * @deprecated
     */
    public *generateTypeStatements(
        factory: ts.NodeFactory,
        namer: Namer,
    ) {
        for (const [nodeId, metaSchemaId] of this.nodeMetaMap) {

            const codeGenerator = this.typeCodeGenerators[metaSchemaId];
            yield* codeGenerator.generateStatements(
                factory,
                namer,
                nodeId,
            );
        }
    }

    /**
     * @deprecated
     */
    public *generateValidatorStatements(
        factory: ts.NodeFactory,
        namer: Namer,
    ) {
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
                namer,
                nodeId,
            );
        }
    }

    /**
     * @deprecated
     */
    public *generateSpecStatements(
        factory: ts.NodeFactory,
        namer: Namer,
        nodeUrl: URL,
    ) {
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
                namer,
                nodeId,
            );
        }
    }

    /**
     * @deprecated
     */
    public generateExamples(nodeId: string) {
        const metaSchemaId = this.nodeMetaMap.get(nodeId);
        if (metaSchemaId == null) {
            throw new Error("node not found");
        }

        const exampleGenerator = this.exampleGenerators[metaSchemaId];
        return exampleGenerator.generateFromNode(nodeId);
    }

    /**
     * @deprecated
     */
    public *generateValidExamples(nodeUrl: URL) {
        const nodeId = String(nodeUrl);
        for (const [error, example] of this.generateExamples(nodeId)) {
            if (error > 0) {
                continue;
            }
            yield example;
        }
    }

    /**
     * @deprecated
     */
    public *generateInvalidExamples(nodeUrl: URL) {
        const nodeId = String(nodeUrl);
        for (const [error, example] of this.generateExamples(nodeId)) {
            if (error !== 1) {
                continue;
            }
            yield example;
        }
    }

    public * getTypeNames() {
        for (const [rootNodeId, metaSchemaId] of this.rootNodeMetaMap) {
            yield* this.getNodeTypeNames(rootNodeId, metaSchemaId);
        }
    }

    private * getNodeTypeNames(
        nodeId: string,
        metaSchemaId: MetaSchemaId,
        baseName = "",
    ): Iterable<readonly [string, string]> {
        const reReplace = /[^A-Za-z0-9]/gu;
        const reFilter = /^[A-Za-z]/u;

        const loader: SchemaLoaderBase<unknown> = this.loaders[metaSchemaId];

        const item = loader.getNodeItem(nodeId);

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
            loader.selectSubNodeEntries(nodePointer, node)
        ) {
            const subNodeUrl = new URL(`#${subNodePointer}`, nodeRootUrl);
            const subNodeId = String(subNodeUrl);
            yield* this.getNodeTypeNames(
                subNodeId,
                metaSchemaId,
                name,
            );
        }
    }

    public getComments(nodeId: string) {
        const metaSchemaId = this.nodeMetaMap.get(nodeId);
        if (metaSchemaId == null) {
            throw new Error("meta schema id not found");
        }

        const loader = this.loaders[metaSchemaId];
        return loader.getComments(nodeId);
    }

    public selectNodeTypeDescriptors(nodeId: string): Iterable<TypeDescriptorUnion> {
        const metaSchemaId = this.nodeMetaMap.get(nodeId);
        if (metaSchemaId == null) {
            throw new Error("meta schema id not found");
        }

        const loader = this.loaders[metaSchemaId];
        return loader.selectNodeTypeDescriptors(nodeId);
    }

}
