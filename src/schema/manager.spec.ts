import test from "tape-promise/tape.js";
import { SchemaManager } from "./manager.js";

test("schema-manager", async t => {
    const manager = new SchemaManager();

    const nodeUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaKey = "https://json-schema.org/draft/2020-12/schema";
    await manager.loadFromURL(
        nodeUrl,
        null,
        schemaKey,
    );

    manager.indexNodes();
    manager.nameNodes();

    // eslint-disable-next-line no-debugger
    debugger;
});
