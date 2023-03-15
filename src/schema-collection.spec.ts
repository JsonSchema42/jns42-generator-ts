import test from "tape-promise/tape.js";
import { SchemaCollection } from "./schema-collection.js";

test("schema-loader", async t => {
    const schemaUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaCollection = await SchemaCollection.loadFromUrl(schemaUrl);

    t.equal(schemaCollection.itemCount, 8);
});
