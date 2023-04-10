import { SchemaLoaderBase } from "../loader.js";
import { metaSchema } from "./meta.js";
import { selectNodeId, selectNodeRef, selectSubNodes } from "./selectors.js";
import { Schema } from "./types.js";
import { validateSchema } from "./validators.js";

export class SchemaLoader extends SchemaLoaderBase<Schema | boolean> {
    protected readonly metaSchemaId = metaSchema.metaSchemaId;

    public validateSchema(node: Schema): boolean {
        for (const error of validateSchema(node, [])) {
            return false;
        }
        return true;
    }

    protected selectNodeUrl(node: Schema) {
        const nodeId = selectNodeId(node);
        if (nodeId != null) {
            const nodeUrl = new URL(nodeId);
            return nodeUrl;
        }
    }

    protected makeNodeUrl(
        node: Schema,
        nodeRootUrl: URL,
        nodePointer: string,
    ): URL {
        let nodeUrl = this.selectNodeUrl(node);
        if (nodeUrl != null) {
            return nodeUrl;
        }

        nodeUrl = new URL(`#${nodePointer}`, nodeRootUrl);
        return nodeUrl;
    }

    public selectSubNodeEntries(
        nodePointer: string,
        node: Schema | boolean,
    ): Iterable<readonly [string, Schema | boolean]> {
        return selectSubNodes(nodePointer, node);
    }

    protected async loadFromNode(
        node: Schema,
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
