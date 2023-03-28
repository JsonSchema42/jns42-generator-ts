import { SchemaIndexerBase } from "../indexer.js";
import { SchemaManager } from "../manager.js";
import { SchemaLoader } from "./loader.js";
import { metaSchema } from "./meta.js";
import { selectNodeId, selectNodeInstanceEntries } from "./selectors.js";
import { Schema } from "./types.js";

export class SchemaIndexer extends SchemaIndexerBase<Schema> {
    protected readonly metaSchemaId = metaSchema.metaSchemaId;

    public selectRootNodeEntries(): Iterable<[URL, Schema]> {
        return [...this.loader.getRootNodeItems()].
            map(({ nodeUrl, node }) => [nodeUrl, node]);
    }

    public selectSubNodeEntries(
        nodePointer: string,
        node: Schema,
    ): Iterable<readonly [string, Schema]> {
        return selectNodeInstanceEntries(nodePointer, node);
    }

    protected makeNodeId(
        node: Schema,
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
