import { selectNodeChildEntries, selectNodeId } from "./selectors/index.js";

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
        const id = selectNodeId(node);
        if (id != null) {
            nodeUrl = id;
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

