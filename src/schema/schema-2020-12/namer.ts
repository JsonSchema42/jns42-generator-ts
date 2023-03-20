import camelcase from "camelcase";
import { pointerToHash } from "../../utils/index.js";
import { SchemaManager } from "../manager.js";
import { SchemaNamerBase } from "../namer.js";
import { SchemaIndexer } from "./indexer.js";
import { selectNodeInstanceEntries } from "./selectors.js";

export class SchemaNamer extends SchemaNamerBase {

    constructor(
        manager: SchemaManager,
        private readonly indexer: SchemaIndexer,
    ) {
        super(manager);
    }

    public * getTypeNames(
        nodeId: string,
        baseName = "",
    ): Iterable<readonly [string, string]> {
        const re = /[^A-Za-z0-9]/u;

        const nodeItem = this.indexer.getNodeItem(nodeId);
        if (nodeItem == null) {
            throw new Error("nodeId not found");
        }

        const pathParts = nodeItem.nodeBaseUrl.pathname.
            split("/").
            map(decodeURI).
            map(value => value.replace(re, ""));
        const pointerParts = nodeItem.nodePointer.
            split("/").
            map(decodeURI).
            map(value => value.replace(re, ""));

        const nameParts = nodeItem.nodePointer === "" ?
            [
                pathParts[pathParts.length - 1],
                pointerParts[pointerParts.length - 1],
            ] :
            [
                baseName,
                pointerParts[pointerParts.length - 1],
            ];

        const name = camelcase(nameParts, { pascalCase: true });

        yield [nodeId, name] as const;

        for (
            const [subNodePointer, subNode] of
            selectNodeInstanceEntries(nodeItem.nodePointer, nodeItem.node)
        ) {
            const subNodeUrl = new URL(pointerToHash(subNodePointer), nodeItem.nodeBaseUrl);
            const subNodeId = String(subNodeUrl);
            yield* this.getTypeNames(
                subNodeId,
                name,
            );
        }

    }
}
