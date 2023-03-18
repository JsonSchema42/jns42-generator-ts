import { SchemaLoaderBase } from "./loader.js";
import { SchemaManager } from "./manager.js";

export interface SchemaMeta<K extends string, N> {
    metaSchemaKey: K;
    metaSchemaUrl: URL
    isSchemaRootNode(node: unknown): node is N;
    newSchemaLoader(commonSchemaLoader: SchemaManager): SchemaLoaderBase
}
