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
        if (node == null) {
            return;
        }

        if (typeof node === "object") {
            if (
                "$id" in node &&
                typeof node.$id === "string"
            ) {
                nodeUrl = new URL(node.$id);
            }
        }

        if (schemaNodeIndex.has(String(nodeUrl))) {
            throw new Error("duplicate id");
        }
        schemaNodeIndex.set(String(nodeUrl), node);

        if (typeof node === "object") {
            for (const [key, subNode] of Object.entries(node)) {
                const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/${encodeURIComponent(key)}`, nodeUrl);
                collectNode(subNodeUrl, subNode);
            }
        }
    }
}

