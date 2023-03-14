import camelCase from "camelcase";
import { SchemaNodeIndexItem } from "./schema-indexer.js";
import { selectNodeAdditionalPropertyEntries, selectNodeAllOfEntries, selectNodeAnyOfEntries, selectNodeItemEntries, selectNodeOneOfEntries, selectNodePrefixItemEntries, selectNodePropertyEntries, selectNodeUnrefUrl } from "./selectors/index.js";

export interface SchemaTypeNameItem {
    nodeUrl: URL
    name: string
}

export function* findSchemaTypeItems(
    schemaNodeIndex: Map<string, SchemaNodeIndexItem>,
    nodeUrl: URL,
    baseName = "",
): Iterable<SchemaTypeNameItem> {
    const name = makeTypeName(nodeUrl, baseName);

    yield { name, nodeUrl };

    const item = schemaNodeIndex.get(String(nodeUrl));
    if (item == null) {
        throw new Error("node not found");
    }

    const { node } = item;

    for (const [childNodeUrl, childNode] of selectNodePropertyEntries(nodeUrl, node)) {
        const nodeUnrefUrl = selectNodeUnrefUrl(childNodeUrl, childNode);

        yield* findSchemaTypeItems(
            schemaNodeIndex,
            nodeUnrefUrl,
            String(childNodeUrl) === String(nodeUnrefUrl) ? name : "",
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeAdditionalPropertyEntries(nodeUrl, node)) {
        const nodeUnrefUrl = selectNodeUnrefUrl(childNodeUrl, childNode);

        yield* findSchemaTypeItems(
            schemaNodeIndex,
            nodeUnrefUrl,
            String(childNodeUrl) === String(nodeUnrefUrl) ? name : "",
        );
    }

    for (const [childNodeUrl, childNode] of selectNodePrefixItemEntries(nodeUrl, node)) {
        const nodeUnrefUrl = selectNodeUnrefUrl(childNodeUrl, childNode);

        yield* findSchemaTypeItems(
            schemaNodeIndex,
            nodeUnrefUrl,
            String(childNodeUrl) === String(nodeUnrefUrl) ? name : "",
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeItemEntries(nodeUrl, node)) {
        const nodeUnrefUrl = selectNodeUnrefUrl(childNodeUrl, childNode);

        yield* findSchemaTypeItems(
            schemaNodeIndex,
            nodeUnrefUrl,
            String(childNodeUrl) === String(nodeUnrefUrl) ? name : "",
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeAllOfEntries(nodeUrl, node)) {
        const nodeUnrefUrl = selectNodeUnrefUrl(childNodeUrl, childNode);

        yield* findSchemaTypeItems(
            schemaNodeIndex,
            nodeUnrefUrl,
            String(childNodeUrl) === String(nodeUnrefUrl) ? name : "",
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeAnyOfEntries(nodeUrl, node)) {
        const nodeUnrefUrl = selectNodeUnrefUrl(childNodeUrl, childNode);

        yield* findSchemaTypeItems(
            schemaNodeIndex,
            nodeUnrefUrl,
            String(childNodeUrl) === String(nodeUnrefUrl) ? name : "",
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeOneOfEntries(nodeUrl, node)) {
        const nodeUnrefUrl = selectNodeUnrefUrl(childNodeUrl, childNode);

        yield* findSchemaTypeItems(
            schemaNodeIndex,
            nodeUnrefUrl,
            String(childNodeUrl) === String(nodeUnrefUrl) ? name : "",
        );
    }

}

function makeTypeName(url: URL, baseName: string) {
    const parts = new Array<string>();
    const re = /^.*\/(.*?)$/u;

    if (url.hash === "") {
        const match = re.exec(url.pathname);

        if (match != null) {
            parts.push(match[1]);
        }
    }
    else {
        const match = re.exec(url.hash);

        parts.push(baseName);

        if (match != null) {
            parts.push(match[1]);
        }
    }

    return camelCase(parts, { pascalCase: true });
}
