import test from "tape-promise/tape.js";
import { SchemaManager } from "./manager.js";

test("schema-manager", async t => {
    const manager = new SchemaManager();

    const instanceUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    await manager.loadFromURL(
        instanceUrl,
        null,
        schemaUrl,
    );

    // eslint-disable-next-line no-debugger
    debugger;
});
