import * as fs from "fs";
import test from "tape-promise/tape.js";
import ts from "typescript";
import { generateTypes } from "./generate.js";
import { loadSchemaMap } from "./schema-collection.js";
import { createSchemaNodeIndex } from "./schema-indexer.js";
import { findSchemaTypeItems } from "./schema-namer.js";

test("schema-types", async t => {
    const schemaUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaMap = await loadSchemaMap(schemaUrl);

    const schemaNodeIndex = createSchemaNodeIndex(schemaMap);

    const schemaTypeItems = [...findSchemaTypeItems(
        schemaNodeIndex,
        schemaMap,
    )];

    const schemaTypeItemIndex = new Map(
        schemaTypeItems.map(item => [String(item.nodeUrl), item] as const),
    );

    const factory = ts.factory;

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });

    const nodes = [...generateTypes(
        factory,
        schemaNodeIndex,
        schemaTypeItemIndex,
    )];

    const sourceFile = factory.createSourceFile(
        nodes,
        factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None,
    );

    const content = printer.printFile(sourceFile);

    fs.writeFileSync(".schema.ts", content);
});
