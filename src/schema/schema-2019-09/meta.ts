import { MetaSchemaInfo } from "../meta.js";
import { isSchemaRootNode } from "./node.js";
import { Schema } from "./types.js";

const metaSchemaId = "https://json-schema.org/draft/2019-09/schema";

export const metaSchema: MetaSchemaInfo<typeof metaSchemaId, Schema> = {
    metaSchemaId,
    isSchemaRootNode,
};

