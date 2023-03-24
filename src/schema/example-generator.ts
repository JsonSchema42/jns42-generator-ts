import { SchemaManager } from "./manager.js";

export abstract class SchemaExampleGeneratorBase {
    constructor(
        protected readonly manager: SchemaManager,
    ) {
    }

    public abstract generateValidExamples(nodeUrl: URL): Iterable<unknown>

}

