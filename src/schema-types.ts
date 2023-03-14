import camelCase from "camelcase";
import { SchemaNodeIndexItem } from "./schema-indexer.js";
import { SchemaMapItem } from "./schema-loader.js";
import { selectNodeAdditionalPropertyEntries, selectNodeAllOfEntries, selectNodeAnyOfEntries, selectNodeDefEntries, selectNodeItemEntries, selectNodeOneOfEntries, selectNodePrefixItemEntries, selectNodePropertyEntries } from "./selectors/index.js";

export interface SchemaTypeNameItem {
    nodeUrl: URL
    name: string
}

export function* findSchemaTypeItems(
    schemaNodeIndex: Map<string, SchemaNodeIndexItem>,
    schemaMap: Map<string, SchemaMapItem>,
) {
    for (const schemaMapItem of schemaMap.values()) {
        const baseName = makeTypeBaseName(schemaMapItem.schemaUrl);

        yield* findNodeTypeItems(
            schemaNodeIndex,
            schemaMapItem.schemaUrl,
            baseName,
        );
    }
}

export function* findNodeTypeItems(
    schemaNodeIndex: Map<string, SchemaNodeIndexItem>,
    nodeUrl: URL,
    baseName: string,
): Iterable<SchemaTypeNameItem> {
    const name = makeTypeName(nodeUrl, baseName);

    yield { name, nodeUrl };

    const item = schemaNodeIndex.get(String(nodeUrl));
    if (item == null) {
        throw new Error("node not found");
    }

    const { node } = item;

    for (const [childNodeUrl, childNode] of selectNodeDefEntries(nodeUrl, node)) {
        yield* findNodeTypeItems(
            schemaNodeIndex,
            childNodeUrl,
            name,
        );
    }

    for (const [childNodeUrl, childNode] of selectNodePropertyEntries(nodeUrl, node)) {
        yield* findNodeTypeItems(
            schemaNodeIndex,
            childNodeUrl,
            name,
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeAdditionalPropertyEntries(nodeUrl, node)) {
        yield* findNodeTypeItems(
            schemaNodeIndex,
            childNodeUrl,
            name,
        );
    }

    for (const [childNodeUrl, childNode] of selectNodePrefixItemEntries(nodeUrl, node)) {
        yield* findNodeTypeItems(
            schemaNodeIndex,
            childNodeUrl,
            name,
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeItemEntries(nodeUrl, node)) {
        yield* findNodeTypeItems(
            schemaNodeIndex,
            childNodeUrl,
            name,
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeAllOfEntries(nodeUrl, node)) {
        yield* findNodeTypeItems(
            schemaNodeIndex,
            childNodeUrl,
            name,
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeAnyOfEntries(nodeUrl, node)) {
        yield* findNodeTypeItems(
            schemaNodeIndex,
            childNodeUrl,
            name,
        );
    }

    for (const [childNodeUrl, childNode] of selectNodeOneOfEntries(nodeUrl, node)) {
        yield* findNodeTypeItems(
            schemaNodeIndex,
            childNodeUrl,
            name,
        );
    }

}

function makeTypeBaseName(url: URL) {
    const parts = new Array<string>();
    const re = /^.*\/(.*?)$/u;
    const re2 = /[^a-z0-9]/gi;

    const match = re.exec(url.pathname);

    if (match != null) {
        parts.push(match[1].replace(re2, ""));
    }

    return camelCase(parts, { pascalCase: true });
}

function makeTypeName(url: URL, baseName: string) {
    const parts = new Array<string>();
    const re = /^.*\/(.*?)$/u;
    const re2 = /[^a-z0-9]/gi;

    const match = re.exec(url.hash);

    parts.push(baseName);

    if (match != null) {
        parts.push(match[1].replace(re2, ""));
    }

    return camelCase(parts, { pascalCase: true });
}
