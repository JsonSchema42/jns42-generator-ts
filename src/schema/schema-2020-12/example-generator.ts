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
                yield* this.generateExampleForType(type);
            }
        }

    }

    private * generateExampleForType(type: string) {
        switch (type) {
            case "null":
                yield null;
                break;

            case "array":
                yield [];
                break;

            case "object":
                yield {};
                break;

            case "string":
                yield "";
                break;

            case "number":
                yield 0.5;
                break;

            case "integer":
                yield 1;
                break;

            case "boolean":
                yield true;
                yield false;
                break;

            default:
                throw new Error("type not supported");
        }
    }

}

