import { simpleTypes } from "../utils/index.js";
import { SchemaManager } from "./manager.js";

export abstract class SchemaExampleGeneratorBase {
    public abstract generateFromNode(
        nodeId: string,
    ): Iterable<[number, unknown]>

    constructor(
        protected readonly manager: SchemaManager,
    ) {
    }

    public generateFromUrl(
        nodeUrl: URL,
    ): Iterable<[number, unknown]> {
        const nodeId = String(nodeUrl);
        return this.generateFromNode(nodeId);
    }

    protected *generateForTypes(
        nodeId: string,
        types: string[],
    ): Iterable<[number, unknown]> {
        const typeSet = new Set(types);

        for (const type of simpleTypes) {
            if (typeSet.has(type)) {
                yield* this.generateForType(
                    nodeId,
                    type,
                );
            }
            else {
                switch (type) {
                    case "null":
                        yield [1, null];
                        break;

                    case "array":
                        yield [1, []];
                        break;

                    case "object":
                        yield [1, {}];
                        break;

                    case "string":
                        yield [1, "fail!!"];
                        break;

                    case "number":
                        yield [1, 10.1];
                        break;

                    case "integer":
                        yield [1, 10];
                        break;

                    case "boolean":
                        yield [1, true];
                        yield [1, false];
                        break;
                }
            }
        }
    }

    protected * generateForType(
        nodeId: string,
        type: string,
    ): Iterable<[number, unknown]> {
        switch (type) {
            case "null":
                yield* this.generateForNull(
                    nodeId,
                );
                break;

            case "array":
                yield* this.generateForArray(
                    nodeId,
                );
                break;

            case "object":
                yield* this.generateForObject(
                    nodeId,
                );
                break;

            case "string":
                yield* this.generateForString(
                    nodeId,
                );
                break;

            case "number":
                yield* this.generateForNumber(
                    nodeId,
                );
                break;

            case "integer":
                yield* this.generateForInteger(
                    nodeId,
                );
                break;

            case "boolean":
                yield* this.generateForBoolean(
                    nodeId,
                );
                break;

            default:
                throw new Error("type not supported");

        }
    }

    protected * generateForNull(
        nodeId: string,
    ): Iterable<[number, unknown]> {
        yield [0, null];
    }

    protected abstract generateForArray(
        nodeId: string,
    ): Iterable<[number, unknown]>

    protected abstract generateForObject(
        nodeId: string,
    ): Iterable<[number, unknown]>

    protected abstract generateForString(
        nodeId: string,
    ): Iterable<[number, unknown]>

    protected abstract generateForNumber(
        nodeId: string,
    ): Iterable<[number, unknown]>

    protected abstract generateForInteger(
        nodeId: string,
    ): Iterable<[number, unknown]>

    protected abstract generateForBoolean(
        nodeId: string,
    ): Iterable<[number, unknown]>

}

