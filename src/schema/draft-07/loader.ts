import * as common from "../index.js";

export class SchemaLoader extends common.SchemaLoaderBase {

    public loadFromNode(
        schemaRootNode: unknown,
        instanceUrl: URL,
        referencingInstanceUrl: URL | null,
    ): void {
        throw new Error("Method not implemented.");
    }

}
