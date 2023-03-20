import * as fs from "fs";
import test from "tape-promise/tape.js";
import ts from "typescript";
import { SchemaManager } from "./manager.js";

test("schema-manager", async t => {
    const manager = new SchemaManager();

    const nodeUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaKey = "https://json-schema.org/draft/2020-12/schema";
    await manager.loadFromURL(
        nodeUrl,
        null,
        schemaKey,
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

    fs.writeFileSync("src/.schema.ts", content);
});
