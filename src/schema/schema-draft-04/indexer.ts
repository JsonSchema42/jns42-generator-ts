import { SchemaIndexerBase } from "../indexer.js";
import { SchemaManager } from "../manager.js";
import { SchemaLoader } from "./loader.js";
import { metaSchema } from "./meta.js";
import { SchemaNode } from "./node.js";
import { selectNodeInstanceEntries } from "./selectors.js";

export interface SchemaIndexerNodeItem {
    node: SchemaNode;
    nodeBaseUrl: URL;
    nodePointer: string;
}

export class SchemaIndexer extends SchemaIndexerBase {
    private readonly nodeMap = new Map<string, SchemaIndexerNodeItem>();

    constructor(
        manager: SchemaManager,
        private readonly loader: SchemaLoader,
    ) {
        super(manager);
    }

    public getNodeItem(nodeId: string) {
        return this.nodeMap.get(nodeId);
    }

    public indexNodes() {
        for (const item of this.loader.getRootNodeItems()) {
            this.indexNode(
                item.node,
                item.nodeUrl,
                "",
            );
        }
    }

    public indexNode(
        node: SchemaNode,
        nodeBaseUrl: URL,
        nodePointer: string,
    ) {
        const nodeUrl = new URL(`#${nodePointer}`, nodeBaseUrl);
        const nodeId = String(nodeUrl);

        const item: SchemaIndexerNodeItem = {
            node,
            nodeBaseUrl,
            nodePointer,
        };
        if (this.nodeMap.has(nodeId)) {
            throw new Error("duplicate nodeId");
        }
        this.nodeMap.set(nodeId, item);
        this.manager.registerNodeMetaSchema(nodeId, metaSchema.metaSchemaKey);

        for (const [subNodePointer, subNode] of selectNodeInstanceEntries(nodePointer, node)) {
            this.indexNode(
                subNode,
                nodeBaseUrl,
                subNodePointer,
            );
        }
    }

}
