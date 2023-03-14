export async function loadSchemaIndex(schemaUrl: URL) {
    const schemas = new Map<string, unknown>();
    await loadSchema(schemaUrl, schemas);
    return schemas;
}

async function loadSchema(schemaUrl: URL, schemas: Map<string, unknown>) {
    let schema = schemas.get(String(schemaUrl));
    if (schema != null) {
        return;
    }

    schema = await fetchSchema(schemaUrl);
    schemas.set(schemaUrl.href, schema);

    await loadSchemaReferences(schemaUrl, schema, schemas);
}

async function loadSchemaReferences(baseUrl: URL, node: unknown, schemas: Map<string, unknown>) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "$ref" in node &&
            typeof node.$ref === "string"
        ) {
            const referenceSchemaUrl = toServerUrl(new URL(node.$ref, baseUrl));
            await loadSchema(referenceSchemaUrl, schemas);
        }

        const entries = Object.entries(node);
        for (const [key, childNode] of entries) {
            await loadSchemaReferences(baseUrl, childNode, schemas);
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
