import { selectNodeChildEntries, selectNodeRefUrl } from "./selectors/index.js";

export interface SchemaMapItem {
    schemaNode: unknown;
    schemaUrl: URL;
    referencingSchemaUrl: URL | null;
}

export async function loadSchemaMap(
    schemaUrl: URL,
) {
    const schemaMap = new Map<string, SchemaMapItem>();
    await loadSchema(schemaUrl, null, schemaMap);
    return schemaMap;
}

async function loadSchema(
    schemaUrl: URL,
    parentSchemaUrl: URL | null,
    schemaMap: Map<string, SchemaMapItem>,
) {
    let schemaNode = schemaMap.get(String(schemaUrl));
    if (schemaNode != null) {
        return;
    }

    schemaNode = await fetchSchema(schemaUrl);
    schemaMap.set(
        String(schemaUrl),
        {
            schemaNode,
            schemaUrl,
            referencingSchemaUrl: parentSchemaUrl,
        },
    );

    await loadSchemaReferences(
        schemaUrl,
        schemaNode,
        schemaMap,
    );
}

async function loadSchemaReferences(
    nodeUrl: URL,
    node: unknown,
    schemaMap: Map<string, SchemaMapItem>,
) {
    const refNodeUrl = selectNodeRefUrl(nodeUrl, node);

    if (refNodeUrl != null) {
        const referenceSchemaUrl = toServerUrl(refNodeUrl);
        const parentSchemaUrl = toServerUrl(nodeUrl);
        await loadSchema(
            referenceSchemaUrl,
            parentSchemaUrl,
            schemaMap,
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeChildEntries(nodeUrl, node)) {
        await loadSchemaReferences(
            childNodeUrl,
            childNode,
            schemaMap,
        );
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
