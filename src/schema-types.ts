import { selectNodeAdditionalPropertyEntries, selectNodeAllOfEntries, selectNodeAnyOfEntries, selectNodeItemEntries, selectNodeOneOfEntries, selectNodePropertyEntries, selectNodeUnrefUrl } from "./selectors/index.js";

export function* findSchemaTypeUrls(
    schemaNodeIndex: Map<string, unknown>,
    nodeUrl: URL,
): Iterable<URL> {
    yield nodeUrl;

    const node = schemaNodeIndex.get(String(nodeUrl));
    if (node == null) {
        throw new Error("node not found");
    }

    for (const [childNodeUrl, childNode] of selectNodePropertyEntries(nodeUrl, node)) {
        yield* findSchemaTypeUrls(
            schemaNodeIndex,
            selectNodeUnrefUrl(childNodeUrl, childNode),
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeAdditionalPropertyEntries(nodeUrl, node)) {
        yield* findSchemaTypeUrls(
            schemaNodeIndex,
            selectNodeUnrefUrl(childNodeUrl, childNode),
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeItemEntries(nodeUrl, node)) {
        yield* findSchemaTypeUrls(
            schemaNodeIndex,
            selectNodeUnrefUrl(childNodeUrl, childNode),
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeAllOfEntries(nodeUrl, node)) {
        yield* findSchemaTypeUrls(
            schemaNodeIndex,
            selectNodeUnrefUrl(childNodeUrl, childNode),
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeAnyOfEntries(nodeUrl, node)) {
        yield* findSchemaTypeUrls(
            schemaNodeIndex,
            selectNodeUnrefUrl(childNodeUrl, childNode),
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeOneOfEntries(nodeUrl, node)) {
        yield* findSchemaTypeUrls(
            schemaNodeIndex,
            selectNodeUnrefUrl(childNodeUrl, childNode),
        );
    }

}
