import { SchemaManager } from "../schema/index.js";
import { Namer } from "../utils/index.js";

export abstract class JsonGeneratorBase {
    constructor(
        protected readonly namer: Namer,
        protected readonly manager: SchemaManager,
    ) {

    }

}
