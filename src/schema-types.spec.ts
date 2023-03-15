import test from "tape-promise/tape.js";
import { createSchemaNodeIndex } from "./schema-indexer.js";
import { loadSchemaMap } from "./schema-loader.js";
import { findSchemaTypeItems } from "./schema-types.js";

test("schema-types", async t => {
    const schemaUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaMap = await loadSchemaMap(schemaUrl);

    const schemaNodeIndex = createSchemaNodeIndex(schemaMap);

    const schemaTypeItems = [...findSchemaTypeItems(
        schemaNodeIndex,
        schemaMap,
    )];
    t.equal(schemaTypeItems.length, 99);
});
