import { SchemaManager } from "./manager.js";

export abstract class SchemaExampleGeneratorBase {
    constructor(
        protected readonly manager: SchemaManager,
    ) {
    }

    public abstract generateExamplesFromRootUrl(
        nodeUrl: URL,
        valid: boolean,
    ): Iterable<unknown>

}

