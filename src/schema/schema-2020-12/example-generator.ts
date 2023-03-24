import { SchemaExampleGeneratorBase } from "../example-generator.js";
import { SchemaManager } from "../manager.js";
import { SchemaIndexer } from "./indexer.js";
import { SchemaLoader } from "./loader.js";
import { selectNodeType } from "./selectors.js";

export class SchemaExampleGenerator extends SchemaExampleGeneratorBase {
    constructor(
        manager: SchemaManager,
        private readonly loader: SchemaLoader,
        private readonly indexer: SchemaIndexer,
    ) {
        super(manager);
    }

    public *generateValidExamples(nodeUrl: URL): Iterable<unknown> {
        const nodeId = String(nodeUrl);

        const item = this.indexer.getNodeItem(nodeId);
        if (item == null) {
            throw new Error("item not found");
        }

        const types = selectNodeType(item.node);
        if (types != null) {
            for (const type of types) {
                yield* this.generateExamplesForType(type);
            }
        }

    }

    private generateExamplesForType(type: string) {
        switch (type) {
            case "null":
                return this.generateExamplesForNull();

            case "array":
                return this.generateExamplesForArray();

            case "object":
                return this.generateExamplesForObject();

            case "string":
                return this.generateExamplesForString();

            case "number":
                return this.generateExamplesForNumber();

            case "integer":
                return this.generateExamplesForInteger();

            case "boolean":
                return this.generateExamplesForBoolean();

            default:
                throw new Error("type not supported");
        }
    }

    private * generateExamplesForNull() {
        yield null;
    }

    private * generateExamplesForArray() {
        yield [];
    }

    private * generateExamplesForObject() {
        yield {};
    }

    private * generateExamplesForString() {
        yield "";
    }

    private * generateExamplesForNumber() {
        yield 1;
        yield 0.5;
    }

    private * generateExamplesForInteger() {
        yield 1;
    }

    private * generateExamplesForBoolean() {
        yield true;
        yield false;
    }

}

