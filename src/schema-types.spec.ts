import test from "tape-promise/tape.js";
import { createSchemaNodeIndex } from "./schema-indexer.js";
import { loadSchemaMap } from "./schema-loader.js";
import { findSchemaTypeUrls } from "./schema-types.js";

test("schema-types", async t => {
    const schemaUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaMap = await loadSchemaMap(schemaUrl);

    t.equal(schemaMap.size, 8);

    const schemaNodeIndex = createSchemaNodeIndex(schemaMap);

    t.equal(schemaNodeIndex.size, 324);

    const schemaUrls = [...findSchemaTypeUrls(
        schemaNodeIndex,
        schemaUrl,
    )];

    t.equal(schemaUrls.length, 89);
});
