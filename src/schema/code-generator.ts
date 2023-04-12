import { SchemaManager } from "./manager.js";

export abstract class SchemaCodeGeneratorBase {
    constructor(
        protected readonly manager: SchemaManager,
    ) {
    }

}

