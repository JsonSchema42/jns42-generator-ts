import { CompoundDescriptorUnion, NodeDescriptor, TypeDescriptorUnion } from "../descriptors.js";
import { SchemaStrategyBase } from "../strategy.js";
import { metaSchemaId } from "./meta.js";
import { selectAllSubNodes, selectAllSubNodesAndSelf, selectNodeId, selectNodeRef, selectNodeSchema, selectSubNodes } from "./selectors.js";
import { Schema } from "./types.js";
import { validateSchema } from "./validators.js";

export class SchemaStrategy extends SchemaStrategyBase<Schema> {
    protected readonly metaSchemaId = metaSchemaId;

    public isSchemaRootNode(node: unknown): node is Schema {
        const schemaId = selectNodeSchema(node as any);
        if (schemaId == null) {
            return false;
        }
        return schemaId === this.metaSchemaId;
    }
    public isSchema(node: unknown): node is Schema {
        for (const error of validateSchema(node as Schema, [])) {
            return false;
        }
        return true;
    }

    public *selectAllReferencedNodeUrls(
        rootNode: Schema,
        rootNodeUrl: URL,
        retrievalUrl: URL,
    ): Iterable<readonly [URL, URL]> {
        for (const [pointer, node] of selectAllSubNodesAndSelf("", rootNode)) {
            const nodeRef = selectNodeRef(node);
            if (nodeRef == null) {
                continue;
            }

            const refNodeUrl = new URL(nodeRef, rootNodeUrl);
            const refRetrievalUrl = new URL(nodeRef, retrievalUrl);
            refRetrievalUrl.hash = "";

            yield [refNodeUrl, refRetrievalUrl] as const;

        }
    }

    public selectNodeUrl(node: Schema) {
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
        node: Schema,
    ): Iterable<readonly [string, Schema]> {
        return selectSubNodes(nodePointer, node);
    }

    public selectAllSubNodeEntries(
        nodePointer: string,
        node: Schema,
    ): Iterable<readonly [string, Schema]> {
        return selectAllSubNodes(nodePointer, node);
    }

    public selectAllSubNodeEntriesAndSelf(
        nodePointer: string,
        node: Schema,
    ): Iterable<readonly [string, Schema]> {
        return selectAllSubNodesAndSelf(nodePointer, node);
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
            await this.context.loadFromUrl(
                nodeRefUrl,
                retrievalRefUrl,
                nodeUrl,
                this.metaSchemaId,
            );
        }

    }

    public *selectNodeDescriptors(
    ): Iterable<NodeDescriptor> {
        yield* [];
    }

    public selectNodeTypeDescriptors(
        nodeId: string,
    ): Iterable<TypeDescriptorUnion> {
        throw new Error("not implemented");
    }

    public selectNodeCompoundDescriptors(
        nodeId: string,
    ): Iterable<CompoundDescriptorUnion> {
        throw new Error("not implemented");
    }

}
