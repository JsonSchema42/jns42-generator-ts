import test from "node:test";
import { projectRoot } from "../utils/index.js";

const schema = await import(`${projectRoot}/.package/string-or-boolean/main.js`);

test("string-or-boolean", () => {
    schema.isStringOrBoolean({});
});
