import * as schema201909 from "./2019-09/index.js";
import * as schema202012 from "./2020-12/index.js";
import * as schemaDraft04 from "./draft-04/index.js";
import * as schemaDraft07 from "./draft-06/index.js";
import * as schemaDraft06 from "./draft-07/index.js";

export class SchemaLoader {

    loaders = [
        new schema202012.SchemaLoader(this),
        new schema201909.SchemaLoader(this),
        new schemaDraft07.SchemaLoader(this),
        new schemaDraft06.SchemaLoader(this),
        new schemaDraft04.SchemaLoader(this),
    ];

    loadFromFile(
        path: string,
        defaultMetaSchemaUrl: URL,
    ) {
        throw new Error("not implemented");
    }

    loadFromURL(
        url: URL,
        defaultMetaSchemaUrl: URL,
    ) {
        throw new Error("not implemented");
    }

    loadFromNode(
        node: unknown,
        defaultMetaSchemaUrl: URL,
    ) {
        throw new Error("not implemented");
    }

}
