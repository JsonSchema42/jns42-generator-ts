import camelcase from "camelcase";
import { SchemaManager } from "./manager.js";

export abstract class SchemaNamerBase<N> {
    protected abstract selectSubNodeEntries(
        nodeId: string,
    ): Iterable<readonly [string, N]>

    protected abstract selectNodeRootUrl(nodeId: string): URL | undefined
    protected abstract selectNodePointer(nodeId: string): string | undefined

    constructor(
        protected readonly manager: SchemaManager,
    ) {
        //
    }

    public * getTypeNames(
        nodeId: string,
        baseName = "",
    ): Iterable<readonly [string, string]> {
        const re = /[^A-Za-z0-9]/u;

        const nodeRootUrl = this.selectNodeRootUrl(nodeId);
        if (nodeRootUrl == null) {
            throw new Error("nodeRootUrl not found");
        }

        const nodePointer = this.selectNodePointer(nodeId);
        if (nodePointer == null) {
            throw new Error("nodePointer not found");
        }

        const pathParts = nodeRootUrl.pathname.
            split("/").
            map(decodeURI).
            map(value => value.replace(re, ""));
        const pointerParts = nodePointer.
            split("/").
            map(decodeURI).
            map(value => value.replace(re, ""));

        const nameParts = nodePointer === "" ?
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
            const [subNodePointer] of
            this.selectSubNodeEntries(nodeId)
        ) {
            const subNodeUrl = new URL(`#${subNodePointer}`, nodeRootUrl);
            const subNodeId = String(subNodeUrl);
            yield* this.getTypeNames(
                subNodeId,
                name,
            );
        }

    }

}

