import camelcase from "camelcase";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { projectRoot } from "../utils/index.js";

const packageNames = [
    "array-with-ref",
    "simple-object",
    "string-or-boolean",
];

for (const packageName of packageNames) {
    const typeName = camelcase(packageName, { pascalCase: true });

    const schema = await import(`${projectRoot}/.package/${packageName}/main.js`);

    const goodDirectory = path.join(
        projectRoot,
        "fixtures",
        "good-instance",
    );
    const badDirectory = path.join(
        projectRoot,
        "fixtures",
        "bad-instance",
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

