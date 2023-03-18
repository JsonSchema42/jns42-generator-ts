import { CommonSchemaLoader, SchemaLoaderBase } from "./loader.js";

export interface SchemaMeta<K extends string, N> {
    metaSchemaKey: K;
    metaSchemaUrl: URL
    isSchemaRootNode(node: unknown): node is N;
    newSchemaLoader(commonSchemaLoader: CommonSchemaLoader): SchemaLoaderBase
}
