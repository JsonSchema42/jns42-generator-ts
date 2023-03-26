import { SchemaIndexerBase } from "../indexer.js";
import { SchemaManager } from "../manager.js";
import { SchemaLoader } from "./loader.js";
import { metaSchema } from "./meta.js";
import { SchemaNode } from "./node.js";
import { selectNodeId, selectNodeInstanceEntries } from "./selectors.js";

export class SchemaIndexer extends SchemaIndexerBase<SchemaNode> {
    protected readonly metaSchemaId = metaSchema.metaSchemaId;

    public selectRootNodeEntries(): Iterable<[URL, SchemaNode]> {
        return [...this.loader.getRootNodeItems()].
            map(({ nodeUrl, node }) => [nodeUrl, node]);
    }

    public selectSubNodeEntries(
        nodePointer: string,
        node: SchemaNode,
    ): Iterable<readonly [string, SchemaNode]> {
        return selectNodeInstanceEntries(nodePointer, node);
    }

    protected makeNodeId(
        node: SchemaNode,
        nodeRootUrl: URL,
        nodePointer: string,
    ): string {
        /*
        if a node has an id set, use that!
        */
        const nodeId = selectNodeId(node);
        if (nodeId != null) {
            return nodeId;
        }

        const nodeUrl = new URL(`#${nodePointer}`, nodeRootUrl);
        return String(nodeUrl);
    }

    constructor(
        manager: SchemaManager,
        private readonly loader: SchemaLoader,
    ) {
        super(manager);
    }

}
