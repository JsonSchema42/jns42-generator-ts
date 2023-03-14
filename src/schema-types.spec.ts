import test from "tape-promise/tape.js";
import { createSchemaNodeIndex } from "./schema-indexer.js";
import { loadSchemaMap } from "./schema-loader.js";
import { findSchemaTypeItems } from "./schema-types.js";

test("schema-types", async t => {
    const schemaUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaMap = await loadSchemaMap(schemaUrl);

    t.equal(schemaMap.size, 8);

    const schemaNodeIndex = createSchemaNodeIndex(schemaMap);

    t.equal(schemaNodeIndex.size, 324);

    const schemaTypeItems = [...findSchemaTypeItems(
        schemaNodeIndex,
        schemaUrl,
    )];
    t.equal(schemaTypeItems.length, 89);

    const schemaTypeMap = new Map(
        schemaTypeItems.map(item => [String(item.nodeUrl), item] as const),
    );
    t.equal(schemaTypeMap.size, 67);
});
