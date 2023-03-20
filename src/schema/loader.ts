import { SchemaManager } from "./manager.js";

export abstract class SchemaLoaderBase {
    constructor(
        protected readonly manager: SchemaManager,
    ) {
        //
    }

    public abstract loadFromNode(
        node: unknown,
        nodeUrl: URL,
        referencingNodeUrl: URL | null,
    ): Promise<void>;

}

