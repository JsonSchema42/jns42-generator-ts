import { FederatedSchemaLoader } from "./federated-loader.js";

export abstract class SchemaLoaderBase {
    constructor(
        protected readonly federatedLoader: FederatedSchemaLoader,
    ) {
        //
    }

    public abstract loadFromNode(
        schemaRootNode: unknown,
        instanceUrl: URL,
        referencingInstanceUrl: URL | null,
    ): Promise<void>;

}

