import * as fs from "fs";
import test from "tape-promise/tape.js";
import ts from "typescript";
import { SchemaCollection } from "./schema-collection.js";
import { SchemaIndexer } from "./schema-indexer.js";
import { SchemaNamer } from "./schema-namer.js";
import { SchemaTypeGenerator } from "./schema-type-generator.js";
import { SchemaValidationGenerator } from "./schema-validation-generator.js";

test("schema-generator", async t => {
    const instanceUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaCollection = await SchemaCollection.loadFromUrl(instanceUrl, schemaUrl);

    const schemaIndexer = new SchemaIndexer(schemaCollection);
    const schemaNamer = new SchemaNamer(schemaCollection);
    const schemaTypeGenerator = new SchemaTypeGenerator(
        ts.factory,
        schemaCollection,
        schemaIndexer,
        schemaNamer,
    );
    const schemaValidationGenerator = new SchemaValidationGenerator(
        ts.factory,
        schemaCollection,
        schemaIndexer,
        schemaNamer,
    );

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
        ...schemaTypeGenerator.generateTypeDeclarations(),
        ...schemaValidationGenerator.generateFunctionDeclarations(),
    ];

    const sourceFile = ts.factory.createSourceFile(
        nodes,
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None,
    );

    const content = banner + printer.printFile(sourceFile);

    fs.writeFileSync("src/.schema.ts", content);
});
