import * as schemaDraft04 from "./draft-04/index.js";
import * as schemaDraft07 from "./draft-06/index.js";
import * as schemaDraft06 from "./draft-07/index.js";
import * as schema201909 from "./draft-2019-09/index.js";
import * as schema202012 from "./draft-2020-12/index.js";

export const metaSchemas: MetaSchemaId[] = [
    schema202012.metaSchemaId,
    schema201909.metaSchemaId,
    schemaDraft07.metaSchemaId,
    schemaDraft06.metaSchemaId,
    schemaDraft04.metaSchemaId,
];

export type MetaSchemaId =
    typeof schema202012.metaSchemaId |
    typeof schema201909.metaSchemaId |
    typeof schemaDraft07.metaSchemaId |
    typeof schemaDraft06.metaSchemaId |
    typeof schemaDraft04.metaSchemaId;

