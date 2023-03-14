import test from "tape-promise/tape.js";
import { loadSchemaMap } from "./schema-loader.js";

test("schema-loader", async t => {
    const schemaUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaMap = await loadSchemaMap(schemaUrl);

    t.equal(schemaMap.size, 8);
});
