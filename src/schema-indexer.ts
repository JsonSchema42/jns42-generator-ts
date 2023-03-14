import { selectNodeAnchorUrl, selectNodeChildEntries, selectNodeIdUrl } from "./selectors/index.js";

export function createSchemaNodeIndex(
    schemaMap: Map<string, unknown>,
) {
    const schemaNodeIndex = new Map<string, unknown>();

    for (const [schemaUrl, schemaNode] of schemaMap) {
        collectNode(new URL(schemaUrl), schemaNode);
    }

    return schemaNodeIndex;

    function collectNode(
        nodeUrl: URL,
        node: unknown,
    ) {
        const idUrl = selectNodeIdUrl(node);
        if (idUrl != null) {
            nodeUrl = idUrl;
        }

        const anchorUrl = selectNodeAnchorUrl(nodeUrl, node);
        if (anchorUrl != null) {
            nodeUrl = anchorUrl;
        }

        if (schemaNodeIndex.has(String(nodeUrl))) {
            throw new Error("duplicate id");
        }
        schemaNodeIndex.set(String(nodeUrl), node);

        for (const [childNodeUrl, childNode] of selectNodeChildEntries(nodeUrl, node)) {
            collectNode(childNodeUrl, childNode);
        }
    }
}

