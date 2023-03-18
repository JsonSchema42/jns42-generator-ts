import { SchemaManager } from "./manager.js";

export abstract class SchemaLoaderBase {
    constructor(
        protected readonly commonSchemaLoader: SchemaManager,
    ) {
        //
    }

    public abstract loadFromNode(
        schemaRootNode: unknown,
        instanceUrl: URL,
        referencingInstanceUrl: URL | null,
    ): Promise<void>;

}

