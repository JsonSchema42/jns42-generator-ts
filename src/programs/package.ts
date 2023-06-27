import * as path from "node:path";
import ts from "typescript";
import * as yargs from "yargs";
import { generatePackage } from "../generators/index.js";
import * as schemaDraft04 from "../schema/draft-04/index.js";
import * as schemaDraft06 from "../schema/draft-06/index.js";
import * as schemaDraft07 from "../schema/draft-07/index.js";
import * as schema201909 from "../schema/draft-2019-09/index.js";
import * as schema202012 from "../schema/draft-2020-12/index.js";
import { Node, SchemaContext } from "../schema/index.js";
import { Namer } from "../utils/index.js";

export function configurePackageProgram(argv: yargs.Argv) {
    return argv.command(
        "package [schema-url]",
        "create package from schema-url",
        (yargs) =>
            yargs
                .positional("schema-url", {
                    description: "url to download schema from",
                    type: "string",
                })
                .option("default-meta-schema-url", {
                    description: "the default meta schema to use",
                    type: "string",
                    choices: [
                        schema202012.metaSchemaId,
                        schema201909.metaSchemaId,
                        schemaDraft07.metaSchemaId,
                        schemaDraft06.metaSchemaId,
                        schemaDraft04.metaSchemaId,
                    ] as const,
                    default: schema202012.metaSchemaId,
                })
                .option("package-directory", {
                    description: "where to output the package",
                    type: "string",
                })
                .option("package-name", {
                    description: "name of the package",
                    type: "string",
                })
                .option("package-version", {
                    description: "version of the package",
                    type: "string",
                })
                .option("root-name-part", {
                    description: "root name of the schema",
                    type: "string",
                    default: "root",
                })
                .option("root-namespace-part", {
                    description: "root namespace of the schema",
                    type: "string",
                    default: "schema",
                }),
        (argv) => main(argv as MainOptions)
    );
}

interface MainOptions {
    schemaUrl: string;
    defaultMetaSchemaUrl: string;
    packageDirectory: string;
    packageName: string;
    packageVersion: string;
    rootNamePart: string;
    rootNamespacePart: string;
}

async function main(options: MainOptions) {
    const schemaUrl = new URL(options.schemaUrl);
    const defaultMetaSchemaId = options.defaultMetaSchemaUrl;
    const packageDirectoryPath = path.resolve(options.packageDirectory);
    const { packageName, packageVersion, rootNamePart: defaultTypeName } = options;

    const context = new SchemaContext();
    context.registerStrategy(schema202012.metaSchemaId, new schema202012.SchemaStrategy());
    context.registerStrategy(schema201909.metaSchemaId, new schema201909.SchemaStrategy());
    context.registerStrategy(schemaDraft07.metaSchemaId, new schemaDraft07.SchemaStrategy());
    context.registerStrategy(schemaDraft06.metaSchemaId, new schemaDraft06.SchemaStrategy());
    context.registerStrategy(schemaDraft04.metaSchemaId, new schemaDraft04.SchemaStrategy());

    await context.loadFromUrl(schemaUrl, schemaUrl, null, defaultMetaSchemaId);

    const allNodes: Record<string, Node> = {};
    const nodes: Record<string, Record<string, Node>> = {};
    for (const [nodeId, node] of context.getNodeEntries()) {
        allNodes[nodeId] = node;

        const nodeUrl = new URL(nodeId);
        const serverId = nodeUrl.origin + nodeUrl.pathname + nodeUrl.search;
        const hash = nodeUrl.hash;
        let nodesByHash = nodes[serverId];
        if (nodesByHash == null) {
            nodesByHash = {};
            nodes[serverId] = nodesByHash;
        }
        nodesByHash[hash] = node;
    }

    const nameNamers: Record<string, Namer> = {};
    for (const [serverId, nodesByHash] of Object.entries(nodes)) {
        const namer = new Namer(options.rootNamePart);
        nameNamers[serverId] = namer;
        for (const [hash, node] of Object.entries(nodesByHash)) {
            const path = hash.replace(/^#/g, "");
            namer.registerPath(hash, path);
        }
    }

    const namespaceNamer = new Namer(options.rootNamespacePart);
    for (const [serverId, nodesByHash] of Object.entries(nodes)) {
        const serverUrl = new URL(serverId);
        const path = serverUrl.pathname;
        namespaceNamer.registerPath(serverId, path);
    }

    const names = Object.fromEntries(
        Object.entries(nameNamers).map(([serverId, namer]) => [serverId, namer.getNames()])
    );
    const namespaces = namespaceNamer.getNames();

    const factory = ts.factory;
    generatePackage(factory, allNodes, namespaces, names, {
        directoryPath: packageDirectoryPath,
        name: packageName,
        version: packageVersion,
    });
}
