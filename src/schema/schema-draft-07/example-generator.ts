import { SchemaExampleGeneratorBase } from "../example-generator.js";
import { SchemaManager } from "../manager.js";

export class SchemaExampleGenerator extends SchemaExampleGeneratorBase {
    constructor(
        manager: SchemaManager,
    ) {
        super(manager);
    }

    public *generateValidExamples(nodeUrl: URL): Iterable<unknown> {
        yield* [];
    }

}

