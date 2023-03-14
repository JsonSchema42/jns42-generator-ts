import test from "tape-promise/tape.js";
import { loadSchemaIndex } from "./schema-loader.js";

test("schema-loader", async t => {
    const schemaUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaIndex = await loadSchemaIndex(schemaUrl);

    t.equal(schemaIndex.size, 8);
});
