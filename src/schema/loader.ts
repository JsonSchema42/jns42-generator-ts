import { SchemaManager } from "./manager.js";

export abstract class SchemaLoaderBase {
    constructor(
        protected readonly manager: SchemaManager,
    ) {
        //
    }

    public abstract loadFromRootNode(
        node: unknown,
        nodeUrl: URL,
        referencingNodeUrl: URL | null,
    ): Promise<void>;

}

