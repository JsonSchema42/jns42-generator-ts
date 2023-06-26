import * as path from "node:path";
import ts from "typescript";
import * as yargs from "yargs";
import { generatePackage } from "../generators/index.js";
import * as schemaDraft04 from "../schema/draft-04/index.js";
import * as schemaDraft06 from "../schema/draft-06/index.js";
import * as schemaDraft07 from "../schema/draft-07/index.js";
import * as schema201909 from "../schema/draft-2019-09/index.js";
import * as schema202012 from "../schema/draft-2020-12/index.js";
import { SchemaContext } from "../schema/index.js";
import { Namer } from "../utils/index.js";

export function configurePackageProgram(argv: yargs.Argv) {
    return argv.command(
        "package [schema-url]",
        "create package from schema-url",
        (yargs) =>
            yargs
                .positional("schema-url", {
                    describe: "url to download schema from",
                    type: "string",
                })
                .option("default-meta-schema-url", {
                    describe: "the default meta schema to use",
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
                    describe: "where to output the package",
                    type: "string",
                })
                .option("package-name", {
                    describe: "name of the package",
                    type: "string",
                })
                .option("package-version", {
                    describe: "version of the package",
                    type: "string",
                })
                .option("unique-name-seed", {
                    describe:
                        "seed to use when generating unique hashes, change if you ever have a naming collision (this should be very rare)",
                    type: "number",
                    default: 0,
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
    uniqueNameSeed: number;
}

async function main(options: MainOptions) {
    const schemaUrl = new URL(options.schemaUrl);
    const defaultMetaSchemaId = options.defaultMetaSchemaUrl;
    const packageDirectoryPath = path.resolve(options.packageDirectory);
    const { packageName, packageVersion } = options;

    const context = new SchemaContext();
    context.registerStrategy(schema202012.metaSchemaId, new schema202012.SchemaStrategy());
    context.registerStrategy(schema201909.metaSchemaId, new schema201909.SchemaStrategy());
    context.registerStrategy(schemaDraft07.metaSchemaId, new schemaDraft07.SchemaStrategy());
    context.registerStrategy(schemaDraft06.metaSchemaId, new schemaDraft06.SchemaStrategy());
    context.registerStrategy(schemaDraft04.metaSchemaId, new schemaDraft04.SchemaStrategy());
    await context.loadFromUrl(schemaUrl, schemaUrl, null, defaultMetaSchemaId);

    const namer = new Namer(options.uniqueNameSeed);
    for (const [nodeId, typeName] of context.getTypeNames()) {
        namer.registerName(nodeId, typeName);
    }

    const factory = ts.factory;
    generatePackage(factory, context, namer, {
        directoryPath: packageDirectoryPath,
        name: packageName,
        version: packageVersion,
    });
}
