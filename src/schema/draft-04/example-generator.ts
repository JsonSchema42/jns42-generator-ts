import { SchemaExampleGeneratorBase } from "../example-generator.js";
import { SchemaManager } from "../manager.js";
import { SchemaIndexer } from "./indexer.js";

export class SchemaExampleGenerator extends SchemaExampleGeneratorBase {

    public generateFromNode(nodeId: string): Iterable<[number, unknown]> {
        throw new Error("Method not implemented.");
    }
    protected generateForArray(nodeId: string): Iterable<[number, unknown]> {
        throw new Error("Method not implemented.");
    }
    protected generateForObject(nodeId: string): Iterable<[number, unknown]> {
        throw new Error("Method not implemented.");
    }
    protected generateForString(nodeId: string): Iterable<[number, unknown]> {
        throw new Error("Method not implemented.");
    }
    protected generateForNumber(nodeId: string): Iterable<[number, unknown]> {
        throw new Error("Method not implemented.");
    }
    protected generateForInteger(nodeId: string): Iterable<[number, unknown]> {
        throw new Error("Method not implemented.");
    }
    protected generateForBoolean(nodeId: string): Iterable<[number, unknown]> {
        throw new Error("Method not implemented.");
    }

    constructor(
        manager: SchemaManager,
        private readonly indexer: SchemaIndexer,
    ) {
        super(manager);
    }

}
