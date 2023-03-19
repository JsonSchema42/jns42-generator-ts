import test from "tape-promise/tape.js";
import { FederatedSchemaLoader } from "./federated-loader.js";

test("federated-loader", async t => {
    const loader = new FederatedSchemaLoader();

    const instanceUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    const schemaUrl = new URL("https://json-schema.org/draft/2020-12/schema");
    await loader.loadFromURL(
        instanceUrl,
        null,
        schemaUrl,
    );

    // eslint-disable-next-line no-debugger
    debugger;
});
