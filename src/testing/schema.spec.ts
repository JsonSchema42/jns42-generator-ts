import camelcase from "camelcase";
import cp from "child_process";
import assert from "node:assert/strict";
import fs from "node:fs";
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
    "draft-2019-09",
    "draft-07",
    "draft-06",
    "draft-04",
];

await test("testing fixtures", async () => {
    for (const schemaName of schemaNames) {
        await test(schemaName, async () => {
            for (const packageName of packageNames) {
                await test(packageName, async () => {
                    await runTest(schemaName, packageName);
                });
            }
        });
    }
});

async function runTest(
    schemaName: string,
    packageName: string,
) {
    const packageDirectoryPath = path.join(
        projectRoot,
        ".package",
        "testing",
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

    if (!fs.existsSync(schemaPath)) {
        return;
    }

    await test("generate package", async () => {
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
    });

    await test("install package", () => {
        cp.execSync("npm install", {
            cwd: packageDirectoryPath,
            env: process.env,
        });
    });

    await test("test package", () => {
        cp.execSync("test package", {
            cwd: packageDirectoryPath,
            env: process.env,
        });
    });

    const typeName = camelcase(`${packageName}.json`, { pascalCase: true });

    const validDirectory = path.join(
        projectRoot,
        "fixtures",
        "testing",
        "valid",
        packageName,
    );
    if (fs.existsSync(validDirectory)) {
        await test("valid", async () => {
            const validFiles = fs.readdirSync(validDirectory).
                filter(file => /\.json$/.test(file));

            for (const validFile of validFiles) {
                await test(validFile, async () => {
                    const schema = await import(
                        path.join(packageDirectoryPath, "main.js")
                    );

                    const data = fs.readFileSync(
                        path.join(validDirectory, validFile),
                        "utf-8",
                    );
                    const instance = JSON.parse(data);
                    assert.equal(schema[`is${typeName}`](instance), true);
                });
            }
        });
    }

    const invalidDirectory = path.join(
        projectRoot,
        "fixtures",
        "testing",
        "invalid",
        packageName,
    );
    if (fs.existsSync(invalidDirectory)) {
        await test("invalid", async () => {
            const invalidFiles = fs.readdirSync(invalidDirectory).
                filter(file => /\.json$/.test(file));

            for (const invalidFile of invalidFiles) {
                await test(invalidFile, async () => {
                    const schema = await import(
                        path.join(packageDirectoryPath, "main.js")
                    );

                    const data = fs.readFileSync(
                        path.join(invalidDirectory, invalidFile),
                        "utf-8",
                    );
                    const instance = JSON.parse(data);
                    assert.equal(schema[`is${typeName}`](instance), false);
                });
            }
        });
    }

}
