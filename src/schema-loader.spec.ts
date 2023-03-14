import test from "tape-promise/tape.js";
import { SchemaLoader } from "./schema-loader.js";

test("schema-loader", async t => {
    const schemaUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaLoader = new SchemaLoader();
    await schemaLoader.loadSchema(schemaUrl);

    // eslint-disable-next-line no-debugger
    debugger;
});
