import { MetaSchemaInfo } from "../meta.js";
import { isSchemaRootNode } from "./node.js";
import { Schema } from "./types.js";

const metaSchemaId = "http://json-schema.org/draft-04/schema#";

export const metaSchema: MetaSchemaInfo<typeof metaSchemaId, Schema> = {
    metaSchemaId,
    isSchemaRootNode,
};
