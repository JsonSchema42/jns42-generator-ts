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
    schemaMap.set(schemaUrl.href, schema);

    await loadSchemaReferences(schemaUrl, schema, schemaMap);
}

async function loadSchemaReferences(
    baseUrl: URL,
    node: unknown,
    schemaMap: Map<string, unknown>,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "$ref" in node &&
            typeof node.$ref === "string"
        ) {
            const referenceSchemaUrl = toServerUrl(new URL(node.$ref, baseUrl));
            await loadSchema(referenceSchemaUrl, schemaMap);
        }

        const entries = Object.entries(node);
        for (const [key, childNode] of entries) {
            await loadSchemaReferences(baseUrl, childNode, schemaMap);
        }
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
