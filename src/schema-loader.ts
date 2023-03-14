import { selectNodeChildEntries, selectNodeRef } from "./selectors/index.js";

export async function loadSchemaMap(
    schemaUrl: URL,
) {
    const schemaMap = new Map<string, unknown>();
    await loadSchema(schemaUrl, schemaMap);
    return schemaMap;
}

async function loadSchema(
    schemaUrl: URL,
    schemaMap: Map<string, unknown>,
) {
    let schema = schemaMap.get(String(schemaUrl));
    if (schema != null) {
        return;
    }

    schema = await fetchSchema(schemaUrl);
    schemaMap.set(String(schemaUrl), schema);

    await loadSchemaReferences(schemaUrl, schema, schemaMap);
}

async function loadSchemaReferences(
    nodeUrl: URL,
    node: unknown,
    schemaMap: Map<string, unknown>,
) {
    const ref = selectNodeRef(node);

    if (ref != null) {
        const referenceSchemaUrl = toServerUrl(new URL(ref, nodeUrl));
        await loadSchema(referenceSchemaUrl, schemaMap);
    }

    for (const [childNodeUrl, childNode] of selectNodeChildEntries(nodeUrl, node)) {
        await loadSchemaReferences(childNodeUrl, childNode, schemaMap);
    }
}

async function fetchSchema(schemaUrl: URL) {
    const result = await fetch(schemaUrl);
    const schema = await result.json();

    return schema;
}

function toServerUrl(clientUrl: URL) {
    const serverUrl = new URL(clientUrl);
    serverUrl.hash = "";
    return serverUrl;
}
