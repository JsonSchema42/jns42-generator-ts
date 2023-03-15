import test from "tape-promise/tape.js";
import { createSchemaNodeIndex } from "./schema-indexer.js";
import { loadSchemaMap } from "./schema-loader.js";

test("schema-indexer", async t => {
    const schemaUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaMap = await loadSchemaMap(schemaUrl);

    const schemaNodeIndex = createSchemaNodeIndex(schemaMap);

    t.equal(schemaNodeIndex.size, 332);
});
