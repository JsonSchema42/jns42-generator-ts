import { pointerToHash } from "../../utils/pointer.js";
import * as common from "../index.js";
import { SchemaManager } from "../index.js";
import { SchemaLoader } from "./loader.js";
import { metaSchema } from "./meta.js";
import { SchemaNode } from "./node.js";
import { selectNodeAnchor, selectNodeDynamicAnchor, selectNodeInstanceEntries } from "./selectors.js";

export interface SchemaIndexerNodeItem {
    node: SchemaNode;
    nodeBaseUrl: URL;
    nodePointer: string;
}

export class SchemaIndexer extends common.SchemaIndexerBase {
    private readonly nodeMap = new Map<string, SchemaIndexerNodeItem>();
    private readonly anchorMap = new Map<string, string>();
    private readonly dynamicAnchorMap = new Map<string, string>();

    constructor(
        manager: SchemaManager,
        private readonly loader: SchemaLoader,
    ) {
        super(manager);
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
        const nodeUrl = new URL(pointerToHash(nodePointer), nodeBaseUrl);
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

        const nodeAnchor = selectNodeAnchor(node);
        if (nodeAnchor != null) {
            const anchorUrl = new URL(`#${nodeAnchor}`, nodeBaseUrl);
            const anchorId = String(anchorUrl);
            if (this.anchorMap.has(anchorId)) {
                throw new Error("duplicate anchorId");
            }
            this.anchorMap.set(anchorId, nodeId);
        }

        const nodeDynamicAnchor = selectNodeDynamicAnchor(node);
        if (nodeDynamicAnchor != null) {
            const dynamicAnchorUrl = new URL(`#${nodeDynamicAnchor}`, nodeBaseUrl);
            const dynamicAnchorId = String(dynamicAnchorUrl);
            if (this.dynamicAnchorMap.has(dynamicAnchorId)) {
                throw new Error("duplicate dynamicAnchorId");
            }
            this.dynamicAnchorMap.set(dynamicAnchorId, nodeId);
        }

        for (const [subNodePointer, subNode] of selectNodeInstanceEntries(nodePointer, node)) {
            this.indexNode(
                subNode,
                nodeBaseUrl,
                subNodePointer,
            );
        }
    }

}