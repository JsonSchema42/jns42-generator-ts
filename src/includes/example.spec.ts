import assert from "node:assert";
import fs from "node:fs";
import * as path from "node:path";
import test from "node:test";

test("examples-valid", t => {
    const directoryPath = "examples-valid";
    for (const fileName of fs.readdirSync(directoryPath)) {
        const filePath = path.join(directoryPath, fileName);
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const instance = JSON.parse(fileContent) as unknown;
        const errors = [...[]];

        assert.deepStrictEqual(
            errors,
            [],
            `assertion failed for ${fileName}`,
        );
    }
});

test("examples-invalid", t => {
    const directoryPath = "examples-invalid";
    for (const fileName of fs.readdirSync(directoryPath)) {
        const filePath = path.join(directoryPath, fileName);
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const instance = JSON.parse(fileContent) as unknown;
        const errors = [...[]];

        assert.notDeepStrictEqual(
            errors,
            [],
            `assertion failed for ${fileName}`,
        );
    }
});
