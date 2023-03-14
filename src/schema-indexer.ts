import { SchemaMapItem } from "./schema-loader.js";
import { selectNodeAnchorUrl, selectNodeChildEntries, selectNodeIdUrl } from "./selectors/index.js";

export interface SchemaNodeIndexItem {
    node: unknown;
    nodeUrl: URL;
    schemaUrl: URL;
    parentSchemaUrl: URL | null;
}

export function createSchemaNodeIndex(
    schemaMap: Map<string, SchemaMapItem>,
) {
    const schemaNodeIndex = new Map<string, SchemaNodeIndexItem>();

    for (const { schemaUrl, parentSchemaUrl, schemaNode } of schemaMap.values()) {
        collectNode(schemaUrl, schemaUrl, parentSchemaUrl, schemaNode);
    }

    return schemaNodeIndex;

    function collectNode(
        nodeUrl: URL,
        schemaUrl: URL,
        parentSchemaUrl: URL | null,
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
        schemaNodeIndex.set(
            String(nodeUrl),
            {
                node,
                nodeUrl,
                schemaUrl,
                parentSchemaUrl,
            },
        );

        for (const [childNodeUrl, childNode] of selectNodeChildEntries(nodeUrl, node)) {
            collectNode(
                childNodeUrl,
                schemaUrl,
                parentSchemaUrl,
                childNode,
            );
        }
    }
}

