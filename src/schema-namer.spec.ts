import test from "tape-promise/tape.js";
import { SchemaCollection } from "./schema-collection.js";
import { SchemaNamer } from "./schema-namer.js";

test("schema-names", async t => {
    const instanceUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaCollection = await SchemaCollection.loadFromUrl(instanceUrl);

    const schemaNamer = new SchemaNamer(schemaCollection);

    t.equal(schemaNamer.nameCount, 101);
});
