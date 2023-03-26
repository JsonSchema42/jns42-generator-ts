import { SchemaLoaderBase } from "../loader.js";
import { metaSchema } from "./meta.js";
import { SchemaNode } from "./node.js";
import { selectNodeId, selectNodeInstanceEntries, selectNodeRef } from "./selectors.js";

export class SchemaLoader extends SchemaLoaderBase<SchemaNode> {
    protected readonly metaSchemaId = metaSchema.metaSchemaId;

    protected selectNodeId(node: SchemaNode) {
        return selectNodeId(node);
    }

    protected selectSubNodeEntries(
        nodePointer: string,
        node: SchemaNode,
    ): Iterable<readonly [string, SchemaNode]> {
        return selectNodeInstanceEntries(nodePointer, node);
    }

    protected async loadFromUrl(
        node: SchemaNode,
        nodeUrl: URL,
        retrievalUrl: URL,
    ) {
        const nodeRef = selectNodeRef(node);

        if (nodeRef != null) {
            const nodeRefUrl = new URL(nodeRef, nodeUrl);
            const retrievalRefUrl = new URL(nodeRef, retrievalUrl);
            retrievalRefUrl.hash = "";
            await this.manager.loadFromUrl(
                nodeRefUrl,
                retrievalRefUrl,
                nodeUrl,
                this.metaSchemaId,
            );
        }

    }
}
