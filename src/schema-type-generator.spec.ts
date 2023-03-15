import * as fs from "fs";
import test from "tape-promise/tape.js";
import ts from "typescript";
import { SchemaCollection } from "./schema-collection.js";
import { SchemaIndexer } from "./schema-indexer.js";
import { SchemaNamer } from "./schema-namer.js";
import { SchemaTypeGenerator } from "./schema-type-generator.js";

test("schema-type-generator", async t => {
    const instanceUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaCollection = await SchemaCollection.loadFromUrl(instanceUrl);

    const schemaIndexer = new SchemaIndexer(schemaCollection);
    const schemaNamer = new SchemaNamer(schemaCollection);
    const schemaTypeGenerator = new SchemaTypeGenerator(
        ts.factory,
        schemaCollection,
        schemaIndexer,
        schemaNamer,
    );

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });

    const nodes = [...schemaTypeGenerator.generateTypeDeclarations()];

    const sourceFile = ts.factory.createSourceFile(
        nodes,
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None,
    );

    const content = printer.printFile(sourceFile);

    fs.writeFileSync(".schema.ts", content);
});
