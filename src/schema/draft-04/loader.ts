import { SchemaLoaderBase } from "../loader.js";
import { metaSchema } from "./meta.js";
import { selectNodeId, selectNodeInstanceEntries, selectNodeRef } from "./selectors.js";
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

    protected selectNodeId(node: Schema) {
        return selectNodeId(node);
    }

    protected selectSubNodeEntries(
        nodePointer: string,
        node: Schema | boolean,
    ): Iterable<readonly [string, Schema | boolean]> {
        return selectNodeInstanceEntries(nodePointer, node);
    }

    protected async loadFromUrl(
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
