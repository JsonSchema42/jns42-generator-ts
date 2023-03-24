import * as fs from "fs";
import * as path from "path";
import { PackageJson } from "type-fest";
import ts from "typescript";
import * as yargs from "yargs";
import { SchemaManager } from "../schema/index.js";
import { packageInfo, projectRoot } from "../utils/index.js";

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
}

async function main(options: MainOptions) {
    const schemaUrl = new URL(options.schemaUrl);
    const defaultMetaSchemaKey = options.defaultMetaSchemaUrl;
    const packageDirectoryPath = path.resolve(options.packageDirectory);
    const { packageName, packageVersion } = options;

    const factory = ts.factory;

    const manager = new SchemaManager();

    await manager.loadFromUrl(
        schemaUrl,
        schemaUrl,
        null,
        defaultMetaSchemaKey,
    );

    manager.indexNodes();
    manager.nameNodes();

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(packageDirectoryPath, { recursive: true });

    const packageFileContent = getPackageFileContent(packageName, packageVersion);
    const packageFilePath = path.join(packageDirectoryPath, "package.json");
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(packageFilePath, packageFileContent);

    const tsconfigFileContent = getTsconfigFileContent();
    const tsconfigFilePath = path.join(packageDirectoryPath, "tsconfig.json");
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(tsconfigFilePath, tsconfigFileContent);

    const mainFileContent = getMainFileContent(factory);
    const mainFilePath = path.join(packageDirectoryPath, "main.ts");
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(mainFilePath, mainFileContent);

    const schemaFileContent = getSchemaFileContent(factory, manager);
    const schemaFilePath = path.join(packageDirectoryPath, "schema.ts");
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(schemaFilePath, schemaFileContent);

    const validationSourceFileContent = path.join(projectRoot, "src", "utils", "validation.ts");
    const validationFilePath = path.join(packageDirectoryPath, "validation.ts");
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.copyFileSync(validationSourceFileContent, validationFilePath);
}

function getMainFileContent(
    factory: ts.NodeFactory,
) {
    const banner = "/* eslint-disable */\n";

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });

    const nodes = [
        factory.createExportDeclaration(
            undefined,
            false,
            undefined,
            factory.createStringLiteral("./schema.js"),
            undefined,
        ),
    ];

    const sourceFile = factory.createSourceFile(
        nodes,
        factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None,
    );

    return banner + printer.printFile(sourceFile);
}
function getSchemaFileContent(
    factory: ts.NodeFactory,
    manager: SchemaManager,
) {
    const banner = "/* eslint-disable */\n";

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });

    const nodes = [
        factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
                false,
                undefined,
                factory.createNamespaceImport(factory.createIdentifier("validation")),
            ),
            factory.createStringLiteral("./validation.js"),
        ),
        ...manager.generateStatements(factory),
    ];

    const sourceFile = factory.createSourceFile(
        nodes,
        factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None,
    );

    return banner + printer.printFile(sourceFile);
}

function getPackageFileContent(
    name: string,
    version: string,
) {
    const json: PackageJson = {
        "name": name,
        "version": version,
        "sideEffects": false,
        "type": "module",
        "main": "main.js",
        "types": "main.d.ts",
        "files": [
            "*",
        ],
        "scripts": {
            "prepare": "tsc",
        },
        "author": "",
        "license": "ISC",
        "dependencies": withDependencies([
        ]),
        "devDependencies": withDependencies([
            "typescript",
            "@types/node",
        ]),
    };

    return JSON.stringify(json, undefined, 2);
}

function withDependencies(
    names: string[],
) {
    return names.reduce(
        (o, name) => Object.assign(o, {
            [name]:
                packageInfo.dependencies?.[name] ??
                packageInfo.devDependencies?.[name],
        }),
        {},
    );
}

function getTsconfigFileContent() {
    const json = {
        "compilerOptions": {
            "target": "ES2020",
            "module": "ES2020",
            "moduleResolution": "node",
            "declaration": true,
            "sourceMap": true,
            "importHelpers": true,
            "strict": true,
            "forceConsistentCasingInFileNames": true,
            "esModuleInterop": true,
            "skipLibCheck": true,
        },
    };

    return JSON.stringify(json, undefined, 2);
}

