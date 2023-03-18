export interface SchemaMeta<N = unknown> {
    metaSchemaUrl: URL
    isSchemaRootNode(node: unknown): node is N;
}
