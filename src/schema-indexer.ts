import { SchemaMapItem } from "./schema-loader.js";
import { selectNodeAnchorUrl, selectNodeChildEntries, selectNodeDynamicAnchorUrl, selectNodeIdUrl } from "./selectors/index.js";

export enum SchemaNodeIdentifierType {
    id,
    anchor,
    dynamicAnchor
}

export interface SchemaNodeIndexItem {
    node: unknown;
    idUrl: URL;
    nodeUrl: URL;
    schemaUrl: URL;
    referencingSchemaUrl: URL | null;
    type: SchemaNodeIdentifierType;
}

export function createSchemaNodeIndex(
    schemaMap: Map<string, SchemaMapItem>,
) {
    const schemaNodeIndex = new Map<string, SchemaNodeIndexItem>();

    for (const { schemaUrl, referencingSchemaUrl, schemaNode } of schemaMap.values()) {
        for (const item of emitItems(schemaUrl, schemaUrl, referencingSchemaUrl, schemaNode)) {
            const nodeKey = String(item.idUrl);
            if (schemaNodeIndex.has(nodeKey)) {
                throw new Error("duplicate identifier");
            }
            schemaNodeIndex.set(nodeKey, item);
        }
    }

    return schemaNodeIndex;

}

function* emitItems(
    nodeUrl: URL,
    schemaUrl: URL,
    referencingSchemaUrl: URL | null,
    node: unknown,
): Iterable<SchemaNodeIndexItem> {
    const idUrl = selectNodeIdUrl(node);
    if (idUrl != null) {
        nodeUrl = idUrl;
    }

    const anchorUrl = selectNodeAnchorUrl(nodeUrl, node);
    if (anchorUrl != null) {
        yield {
            node,
            idUrl: anchorUrl,
            nodeUrl,
            schemaUrl,
            referencingSchemaUrl: referencingSchemaUrl,
            type: SchemaNodeIdentifierType.anchor,
        };

    }

    const dynamicAnchorUrl = selectNodeDynamicAnchorUrl(nodeUrl, node);
    if (dynamicAnchorUrl != null) {
        yield {
            node,
            idUrl: dynamicAnchorUrl,
            nodeUrl,
            schemaUrl,
            referencingSchemaUrl: referencingSchemaUrl,
            type: SchemaNodeIdentifierType.dynamicAnchor,
        };
    }

    yield {
        node,
        idUrl: nodeUrl,
        nodeUrl,
        schemaUrl,
        referencingSchemaUrl: referencingSchemaUrl,
        type: SchemaNodeIdentifierType.id,
    };

    for (const [childNodeUrl, childNode] of selectNodeChildEntries(nodeUrl, node)) {
        yield* emitItems(
            childNodeUrl,
            schemaUrl,
            referencingSchemaUrl,
            childNode,
        );
    }

}
