import { SchemaExampleGeneratorBase } from "../example-generator.js";
import { SchemaManager } from "../manager.js";
import { SchemaIndexer } from "./indexer.js";
import { SchemaLoader } from "./loader.js";

export class SchemaExampleGenerator extends SchemaExampleGeneratorBase {
    constructor(
        manager: SchemaManager,
        private readonly loader: SchemaLoader,
        private readonly indexer: SchemaIndexer,
    ) {
        super(manager);
    }

    public *generateExamplesFromRootUrl(nodeUrl: URL): Iterable<unknown> {
        yield* [];
    }

}

