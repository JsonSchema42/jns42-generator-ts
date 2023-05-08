import assert from "node:assert/strict";
import test from "node:test";
import { projectRoot } from "../utils/index.js";

const schema = await import(`${projectRoot}/.package/string-or-boolean/main.js`);

test("string-or-boolean", () => {
    assert.equal(schema.isStringOrBoolean("hi!"), true);
    assert.equal(schema.isStringOrBoolean(true), true);
    assert.equal(schema.isStringOrBoolean({}), false);
    assert.equal(schema.isStringOrBoolean(1), false);
});
