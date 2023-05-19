
import camelcase from "camelcase";
import cp from "child_process";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import { generatePackage } from "../generators/index.js";
import * as schemaDraft04 from "../schema/draft-04/index.js";
import * as schemaDraft06 from "../schema/draft-06/index.js";
import * as schemaDraft07 from "../schema/draft-07/index.js";
import * as schema201909 from "../schema/draft-2019-09/index.js";
import * as schema202012 from "../schema/draft-2020-12/index.js";
import { SchemaContext } from "../schema/index.js";
import { Namer, projectRoot } from "../utils/index.js";

const packageNames = [
    "array-with-ref",
    "simple-object",
    "string-or-boolean",
];

const schemaNames = [
    "draft-2020-12",
];

for (const schemaName of schemaNames) {
    for (const packageName of packageNames) {
        const packageDirectoryPath = path.join(
            projectRoot,
            ".package",
            schemaName,
            packageName,
        );
        const schemaPath = path.join(
            projectRoot,
            "fixtures",
            "testing",
            "schema",
            schemaName,
            `${packageName}.json`,
        );
        const schemaUrl = new URL(`file://${schemaPath}`);

        const context = new SchemaContext();
        context.registerStrategy(
            schema202012.metaSchemaId,
            new schema202012.SchemaStrategy(),
        );
        context.registerStrategy(
            schema201909.metaSchemaId,
            new schema201909.SchemaStrategy(),
        );
        context.registerStrategy(
            schemaDraft07.metaSchemaId,
            new schemaDraft07.SchemaStrategy(),
        );
        context.registerStrategy(
            schemaDraft06.metaSchemaId,
            new schemaDraft06.SchemaStrategy(),
        );
        context.registerStrategy(
            schemaDraft04.metaSchemaId,
            new schemaDraft04.SchemaStrategy(),
        );
        await context.loadFromUrl(
            schemaUrl,
            schemaUrl,
            null,
            schema202012.metaSchemaId,
        );

        const namer = new Namer(new Date().valueOf());
        for (const [nodeId, typeName] of context.getTypeNames()) {
            namer.registerName(nodeId, typeName);
        }

        const factory = ts.factory;
        generatePackage(factory, context, namer, {
            directoryPath: packageDirectoryPath,
            name: packageName,
            version: "v0.0.0",
        });

        cp.execSync("npm install", {
            cwd: packageDirectoryPath,
            env: process.env,
        });

        const typeName = camelcase(packageName, { pascalCase: true });

        const schema = await import(
            path.join(packageDirectoryPath, "main.js")
        );

        const goodDirectory = path.join(
            projectRoot,
            "fixtures",
            "testing",
            "good",
        );
        const badDirectory = path.join(
            projectRoot,
            "fixtures",
            "testing",
            "bad",
        );

        const goodFiles = (await fs.readdir(goodDirectory)).
            filter(file => /\.json$/.test(file));
        const badFiles = (await fs.readdir(badDirectory)).
            filter(file => /\.json$/.test(file));

        test(`${packageName} good`, async () => {
            for (const goodFile of goodFiles) {
                const data = await fs.readFile(
                    path.join(goodDirectory, goodFile),
                    "utf-8",
                );
                const instance = JSON.parse(data);
                assert.equal(schema[`is${typeName}`](instance), true);
            }
        });

        test(`${packageName} bad`, async () => {
            for (const badFile of badFiles) {
                const data = await fs.readFile(
                    path.join(badDirectory, badFile),
                    "utf-8",
                );
                const instance = JSON.parse(data);
                assert.equal(schema[`is${typeName}`](instance), false);
            }
        });
    }

}
