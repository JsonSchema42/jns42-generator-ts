import * as fs from "fs";
import * as path from "path";
import ts from "typescript";
import * as yargs from "yargs";
import { SchemaManager } from "../schema/index.js";

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
                }),
            argv => main(argv as MainOptions),
        );
}

interface MainOptions {
    schemaUrl: string
    defaultMetaSchemaUrl: "https://json-schema.org/draft/2020-12/schema"
    packageDirectory: string
    packageName: string
}

async function main(options: MainOptions) {
    const schemaUrl = new URL(options.schemaUrl);
    const defaultMetaSchemaKey = options.defaultMetaSchemaUrl;
    const packageDirectoryPath = path.resolve(options.packageDirectory);
    const { packageName } = options;

    const manager = new SchemaManager();

    await manager.loadFromURL(
        schemaUrl,
        null,
        defaultMetaSchemaKey,
    );

    manager.indexNodes();
    manager.nameNodes();

    const banner = "/* eslint-disable */\n\n";

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });

    const nodes = [
        ts.factory.createImportDeclaration(
            undefined,
            ts.factory.createImportClause(
                false,
                undefined,
                ts.factory.createNamespaceImport(ts.factory.createIdentifier("validation")),
            ),
            ts.factory.createStringLiteral("./utils/validation.js"),
        ),
        ...manager.generateStatements(ts.factory),
    ];

    const sourceFile = ts.factory.createSourceFile(
        nodes,
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None,
    );

    const content = banner + printer.printFile(sourceFile);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(packageDirectoryPath, { recursive: true });

    const schemaFilePath = path.join(packageDirectoryPath, "schema.ts");
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(schemaFilePath, content);
}
