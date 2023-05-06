import * as path from "node:path";
import ts from "typescript";
import * as yargs from "yargs";
import { generatePackage } from "../generators/index.js";
import { SchemaManager } from "../schema/index.js";
import { Namer } from "../utils/index.js";

export function configureLabProgram(argv: yargs.Argv) {
    return argv.
        command(
            "package [schema-url]",
            "create package from schema-url",
            yargs => yargs
                .positional("schema-url", {
                    describe: "url to download schema from",
                    type: "string",
                }).
                option("default-meta-schema-url", {
                    describe: "the default meta schema to use",
                    type: "string",
                    choices: [
                        "https://json-schema.org/draft/2020-12/schema",
                        "https://json-schema.org/draft/2019-09/schema",
                        "http://json-schema.org/draft-07/schema#",
                        "http://json-schema.org/draft-06/schema#",
                        "http://json-schema.org/draft-04/schema#",
                    ] as const,
                    default: "https://json-schema.org/draft/2020-12/schema",
                }).
                option("package-directory", {
                    describe: "where to output the package",
                    type: "string",
                }).
                option("package-name", {
                    describe: "name of the package",
                    type: "string",
                }).
                option("package-version", {
                    describe: "version of the package",
                    type: "string",
                }).
                option("generate-test", {
                    describe: "generate test for this package (use with caution!)",
                    type: "boolean",
                }).
                option("unique-name-seed", {
                    describe: "seed to use when generating unique hashes, change if you ever have a naming collision (this should be very rare)",
                    type: "number",
                    default: 0,
                }),
            argv => main(argv as MainOptions),
        );
}

interface MainOptions {
    schemaUrl: string
    defaultMetaSchemaUrl: "https://json-schema.org/draft/2020-12/schema"
    packageDirectory: string
    packageName: string
    packageVersion: string
    generateTest: boolean
    uniqueNameSeed: number
}

async function main(options: MainOptions) {
    const schemaUrl = new URL(options.schemaUrl);
    const defaultMetaSchemaId = options.defaultMetaSchemaUrl;
    const packageDirectoryPath = path.resolve(options.packageDirectory);
    const { packageName, packageVersion } = options;

    const factory = ts.factory;

    const namer = new Namer(options.uniqueNameSeed);
    const manager = new SchemaManager();

    const rootNodeUrl = await manager.loadFromUrl(
        schemaUrl,
        schemaUrl,
        null,
        defaultMetaSchemaId,
    );

    for (const [nodeId, typeName] of manager.getTypeNames()) {
        namer.registerName(nodeId, typeName);
    }

    generatePackage(factory, manager, namer, {
        directoryPath: packageDirectoryPath,
        name: packageName,
        version: packageVersion,
    });

}

