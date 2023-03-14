import { selectNodeAdditionalPropertyEntries, selectNodeItemEntries, selectNodePropertyEntries } from "./selectors/index.js";

export function getSchemaUrls(
    schemaNodeIndex: Map<string, unknown>,
    baseUrl: URL,
) {
    const urls = findTypeUrls(schemaNodeIndex, baseUrl);
    return [...urls];
}

function* findTypeUrls(
    schemaNodeIndex: Map<string, unknown>,
    nodeUrl: URL,
): Iterable<URL> {
    yield nodeUrl;

    const node = schemaNodeIndex.get(String(nodeUrl));
    if (node == null) {
        throw new Error("node not found");
    }

    for (const [childNodeUrl, childNode] of selectNodePropertyEntries(nodeUrl, node)) {
        yield* findTypeUrls(schemaNodeIndex, childNodeUrl);
    }

    for (const [childNodeUrl, childNode] of selectNodeAdditionalPropertyEntries(nodeUrl, node)) {
        yield* findTypeUrls(schemaNodeIndex, childNodeUrl);
    }

    for (const [childNodeUrl, childNode] of selectNodeItemEntries(nodeUrl, node)) {
        yield* findTypeUrls(schemaNodeIndex, childNodeUrl);
    }

}
