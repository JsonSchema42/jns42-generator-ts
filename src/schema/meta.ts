import { FederatedSchemaLoader } from "./federated-loader.js";
import { SchemaLoaderBase } from "./loader.js";

export interface SchemaMeta<K extends string, N> {
    metaSchemaKey: K;
    metaSchemaUrl: URL
    isSchemaRootNode(node: unknown): node is N;
    newSchemaLoader(commonSchemaLoader: FederatedSchemaLoader): SchemaLoaderBase
}
