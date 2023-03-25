import { SchemaManager } from "./manager.js";

export abstract class SchemaExampleGeneratorBase {
    constructor(
        protected readonly manager: SchemaManager,
    ) {
    }

    public abstract generateExamplesFromUrl(
        nodeUrl: URL,
    ): Iterable<unknown>

}

