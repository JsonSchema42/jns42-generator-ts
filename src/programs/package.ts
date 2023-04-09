import * as fs from "node:fs";
import * as path from "node:path";
import { PackageJson } from "type-fest";
import ts from "typescript";
import * as yargs from "yargs";
import { SchemaManager } from "../schema/index.js";
import { Namer, packageInfo, projectRoot } from "../utils/index.js";

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
    const manager = new SchemaManager(namer);

    const rootNodeUrl = await manager.loadFromUrl(
        schemaUrl,
        schemaUrl,
        null,
        defaultMetaSchemaId,
    );

    manager.initialize();

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

    const typesFileContent = getTypesFileContent(factory, manager);
    const typesFilePath = path.join(packageDirectoryPath, "types.ts");
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(typesFilePath, typesFileContent);

    const validatorsFileContent = getValidatorsFileContent(factory, manager);
    const validatorsFilePath = path.join(packageDirectoryPath, "validators.ts");
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(validatorsFilePath, validatorsFileContent);

    const validationSourceFileContent = path.join(projectRoot, "src", "includes", "validation.ts");
    const validationFilePath = path.join(packageDirectoryPath, "validation.ts");
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.copyFileSync(validationSourceFileContent, validationFilePath);

    if (options.generateTest) {
        const specFileContent = getSpecFileContent(factory, manager, rootNodeUrl);
        const specFilePath = path.join(packageDirectoryPath, "schema.spec.ts");
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFileSync(specFilePath, specFileContent);

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.mkdirSync(path.join(packageDirectoryPath, "examples", "valid"), { recursive: true });
        {
            let index = 0;
            for (const example of manager.generateValidExamples(rootNodeUrl)) {
                index++;
                const exampleFileContent = JSON.stringify(example, undefined, 2);
                const exampleFilePath = path.join(packageDirectoryPath, "examples", "valid", `valid-${packageName}-${index}.json`);
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                fs.writeFileSync(exampleFilePath, exampleFileContent);
            }
        }

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.mkdirSync(path.join(packageDirectoryPath, "examples", "invalid"), { recursive: true });
        {
            let index = 0;
            for (const example of manager.generateInvalidExamples(rootNodeUrl)) {
                index++;
                const exampleFileContent = JSON.stringify(example, undefined, 2);
                const exampleFilePath = path.join(packageDirectoryPath, "examples", "invalid", `invalid-${packageName}-${index}.json`);
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                fs.writeFileSync(exampleFilePath, exampleFileContent);
            }
        }
    }

}

function getMainFileContent(
    factory: ts.NodeFactory,
) {
    const banner = `
// @generated by
//     __             _____     _                 ___ ___ 
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
//                                 -- www.JsonSchema42.org
    
/* eslint-disable */
/* spellchecker: disable */
`.trim();

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });

    const nodes = [
        factory.createExportDeclaration(
            undefined,
            false,
            undefined,
            factory.createStringLiteral("./types.js"),
            undefined,
        ),
        factory.createExportDeclaration(
            undefined,
            false,
            undefined,
            factory.createStringLiteral("./validators.js"),
            undefined,
        ),
    ];

    const sourceFile = factory.createSourceFile(
        nodes,
        factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None,
    );

    return `${banner}\n\n${printer.printFile(sourceFile)}`;
}

function getTypesFileContent(
    factory: ts.NodeFactory,
    manager: SchemaManager,
) {
    const banner = `
// @generated by
//     __             _____     _                 ___ ___ 
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
//                                 -- www.JsonSchema42.org
    
/* eslint-disable */
/* spellchecker: disable */
`.trim();

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });

    const nodes = [
        ...manager.generateTypeStatements(factory),
    ];

    const sourceFile = factory.createSourceFile(
        nodes,
        factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None,
    );

    return `${banner}\n\n${printer.printFile(sourceFile)}`;
}

function getValidatorsFileContent(
    factory: ts.NodeFactory,
    manager: SchemaManager,
) {
    const banner = `
// @generated by
//     __             _____     _                 ___ ___ 
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
//                                 -- www.JsonSchema42.org
    
/* eslint-disable */
/* spellchecker: disable */
`.trim();

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });

    const nodes = [
        ...manager.generateValidatorStatements(factory),
    ];

    const sourceFile = factory.createSourceFile(
        nodes,
        factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None,
    );

    return `${banner}\n\n${printer.printFile(sourceFile)}`;
}

function getSpecFileContent(
    factory: ts.NodeFactory,
    manager: SchemaManager,
    nodeUrl: URL,
) {
    const banner = `
// @generated by
//     __             _____     _                 ___ ___ 
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
//                                 -- www.JsonSchema42.org
    
/* eslint-disable */
/* spellchecker: disable */
`.trim();

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });

    const nodes = [
        ...manager.generateSpecStatements(factory, nodeUrl),
    ];

    const sourceFile = factory.createSourceFile(
        nodes,
        factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None,
    );

    return `${banner}\n\n${printer.printFile(sourceFile)}`;
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

