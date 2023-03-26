import { SchemaManager } from "../manager.js";
import { SchemaNamerBase } from "../namer.js";
import { SchemaIndexer } from "./indexer.js";
import { SchemaNode } from "./node.js";
import { selectNodeInstanceEntries } from "./selectors.js";

export class SchemaNamer extends SchemaNamerBase<SchemaNode> {

    protected selectSubNodeEntries(
        nodeId: string,
    ): Iterable<readonly [string, unknown]> {
        const item = this.indexer.getNodeItem(nodeId);
        if (item == null) {
            throw new Error("node not found");
        }
        return selectNodeInstanceEntries(item.nodePointer, item.node);
    }

    protected selectNodeRootUrl(
        nodeId: string,
    ): URL | undefined {
        const item = this.indexer.getNodeItem(nodeId);
        if (item == null) {
            throw new Error("node not found");
        }
        return item.nodeRootUrl;
    }

    protected selectNodePointer(
        nodeId: string,
    ): string | undefined {
        const item = this.indexer.getNodeItem(nodeId);
        if (item == null) {
            throw new Error("node not found");
        }
        return item.nodePointer;
    }

    constructor(
        manager: SchemaManager,
        private readonly indexer: SchemaIndexer,
    ) {
        super(manager);
    }

}
