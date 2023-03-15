import test from "tape-promise/tape.js";
import { SchemaCollection } from "./schema-collection.js";
import { SchemaIndexer } from "./schema-indexer.js";

test("schema-indexer", async t => {
    const instanceUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaCollection = await SchemaCollection.loadFromUrl(instanceUrl);

    const schemaIndexer = new SchemaIndexer(schemaCollection);

    t.equal(schemaIndexer.anchorCount, 0);
    t.equal(schemaIndexer.dynamicAnchorCount, 8);
    t.equal(schemaIndexer.nodeCount, 101);
});
