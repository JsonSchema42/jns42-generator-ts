/* eslint-disable */
import * as validation from "../../includes/validation.js";
import * as types from "./types.js";
export function* validateSchema(value: types.Schema, path: string[] = []): Iterable<string[]> {
    if (validation.isValidObjectType(value)) {
        if (value["id"] !== undefined) {
            yield* validateSchemaId(value["id"], [...path, "id"]);
        }
        if (value["$schema"] !== undefined) {
            yield* validateSchemaSchema(value["$schema"], [...path, "$schema"]);
        }
        if (value["title"] !== undefined) {
            yield* validateSchemaTitle(value["title"], [...path, "title"]);
        }
        if (value["description"] !== undefined) {
            yield* validateSchemaDescription(value["description"], [...path, "description"]);
        }
        if (value["default"] !== undefined) {
            yield* validateSchemaDefault(value["default"], [...path, "default"]);
        }
        if (value["multipleOf"] !== undefined) {
            yield* validateSchemaMultipleof(value["multipleOf"], [...path, "multipleOf"]);
        }
        if (value["maximum"] !== undefined) {
            yield* validateSchemaMaximum(value["maximum"], [...path, "maximum"]);
        }
        if (value["exclusiveMaximum"] !== undefined) {
            yield* validateSchemaExclusivemaximum(value["exclusiveMaximum"], [...path, "exclusiveMaximum"]);
        }
        if (value["minimum"] !== undefined) {
            yield* validateSchemaMinimum(value["minimum"], [...path, "minimum"]);
        }
        if (value["exclusiveMinimum"] !== undefined) {
            yield* validateSchemaExclusiveminimum(value["exclusiveMinimum"], [...path, "exclusiveMinimum"]);
        }
        if (value["maxLength"] !== undefined) {
            yield* validateSchemaMaxlength(value["maxLength"], [...path, "maxLength"]);
        }
        if (value["minLength"] !== undefined) {
            yield* validateSchemaMinlength(value["minLength"], [...path, "minLength"]);
        }
        if (value["pattern"] !== undefined) {
            yield* validateSchemaPattern(value["pattern"], [...path, "pattern"]);
        }
        if (value["additionalItems"] !== undefined) {
            yield* validateSchemaAdditionalitems(value["additionalItems"], [...path, "additionalItems"]);
        }
        if (value["items"] !== undefined) {
            yield* validateSchemaItems(value["items"], [...path, "items"]);
        }
        if (value["maxItems"] !== undefined) {
            yield* validateSchemaMaxitems(value["maxItems"], [...path, "maxItems"]);
        }
        if (value["minItems"] !== undefined) {
            yield* validateSchemaMinitems(value["minItems"], [...path, "minItems"]);
        }
        if (value["uniqueItems"] !== undefined) {
            yield* validateSchemaUniqueitems(value["uniqueItems"], [...path, "uniqueItems"]);
        }
        if (value["maxProperties"] !== undefined) {
            yield* validateSchemaMaxproperties(value["maxProperties"], [...path, "maxProperties"]);
        }
        if (value["minProperties"] !== undefined) {
            yield* validateSchemaMinproperties(value["minProperties"], [...path, "minProperties"]);
        }
        if (value["required"] !== undefined) {
            yield* validateSchemaRequired(value["required"], [...path, "required"]);
        }
        if (value["additionalProperties"] !== undefined) {
            yield* validateSchemaAdditionalproperties(value["additionalProperties"], [...path, "additionalProperties"]);
        }
        if (value["definitions"] !== undefined) {
            yield* validateSchemaDefinitions(value["definitions"], [...path, "definitions"]);
        }
        if (value["properties"] !== undefined) {
            yield* validateSchemaProperties(value["properties"], [...path, "properties"]);
        }
        if (value["patternProperties"] !== undefined) {
            yield* validateSchemaPatternproperties(value["patternProperties"], [...path, "patternProperties"]);
        }
        if (value["dependencies"] !== undefined) {
            yield* validateSchemaDependencies(value["dependencies"], [...path, "dependencies"]);
        }
        if (value["enum"] !== undefined) {
            yield* validateSchemaEnum(value["enum"], [...path, "enum"]);
        }
        if (value["type"] !== undefined) {
            yield* validateSchemaType(value["type"], [...path, "type"]);
        }
        if (value["format"] !== undefined) {
            yield* validateSchemaFormat(value["format"], [...path, "format"]);
        }
        if (value["allOf"] !== undefined) {
            yield* validateSchemaAllof(value["allOf"], [...path, "allOf"]);
        }
        if (value["anyOf"] !== undefined) {
            yield* validateSchemaAnyof(value["anyOf"], [...path, "anyOf"]);
        }
        if (value["oneOf"] !== undefined) {
            yield* validateSchemaOneof(value["oneOf"], [...path, "oneOf"]);
        }
        if (value["not"] !== undefined) {
            yield* validateSchemaNot(value["not"], [...path, "not"]);
        }
    }
    else {
        yield path;
    }
}
export function* validateSchemaSchemaarray(value: types.SchemaSchemaarray, path: string[] = []): Iterable<string[]> {
    if (validation.isValidArrayType(value)) {
        if (!validation.isValidMinItems(value, 1)) {
            yield path;
        }
        yield* validateSchemaSchemaarrayItems(value[0], [...path, "0"]);
    }
    else {
        yield path;
    }
}
export function* validateSchemaSchemaarrayItems(value: types.SchemaSchemaarrayItems, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaPositiveinteger(value: types.SchemaPositiveinteger, path: string[] = []): Iterable<string[]> {
    if (validation.isValidIntegerType(value)) {
        if (!validation.isValidMinimum(value, 0)) {
            yield path;
        }
    }
    else {
        yield path;
    }
}
export function* validateSchemaPositiveintegerdefault0(value: types.SchemaPositiveintegerdefault0, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaPositiveintegerdefault00(value: types.SchemaPositiveintegerdefault00, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaPositiveintegerdefault01(value: types.SchemaPositiveintegerdefault01, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaSimpletypes(value: types.SchemaSimpletypes, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaStringarray(value: types.SchemaStringarray, path: string[] = []): Iterable<string[]> {
    if (validation.isValidArrayType(value)) {
        if (!validation.isValidMinItems(value, 1)) {
            yield path;
        }
        if (!validation.isValidUniqueItems(value, true)) {
            yield path;
        }
        yield* validateSchemaStringarrayItems(value[0], [...path, "0"]);
    }
    else {
        yield path;
    }
}
export function* validateSchemaStringarrayItems(value: types.SchemaStringarrayItems, path: string[] = []): Iterable<string[]> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield path;
    }
}
export function* validateSchemaId(value: types.SchemaId, path: string[] = []): Iterable<string[]> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield path;
    }
}
export function* validateSchemaSchema(value: types.SchemaSchema, path: string[] = []): Iterable<string[]> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield path;
    }
}
export function* validateSchemaTitle(value: types.SchemaTitle, path: string[] = []): Iterable<string[]> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield path;
    }
}
export function* validateSchemaDescription(value: types.SchemaDescription, path: string[] = []): Iterable<string[]> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield path;
    }
}
export function* validateSchemaDefault(value: types.SchemaDefault, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaMultipleof(value: types.SchemaMultipleof, path: string[] = []): Iterable<string[]> {
    if (validation.isValidNumberType(value)) {
        if (!validation.isValidExclusiveMinimum(value, 0)) {
            yield path;
        }
    }
    else {
        yield path;
    }
}
export function* validateSchemaMaximum(value: types.SchemaMaximum, path: string[] = []): Iterable<string[]> {
    if (validation.isValidNumberType(value)) {
    }
    else {
        yield path;
    }
}
export function* validateSchemaExclusivemaximum(value: types.SchemaExclusivemaximum, path: string[] = []): Iterable<string[]> {
    if (validation.isValidBooleanType(value)) {
    }
    else {
        yield path;
    }
}
export function* validateSchemaMinimum(value: types.SchemaMinimum, path: string[] = []): Iterable<string[]> {
    if (validation.isValidNumberType(value)) {
    }
    else {
        yield path;
    }
}
export function* validateSchemaExclusiveminimum(value: types.SchemaExclusiveminimum, path: string[] = []): Iterable<string[]> {
    if (validation.isValidBooleanType(value)) {
    }
    else {
        yield path;
    }
}
export function* validateSchemaMaxlength(value: types.SchemaMaxlength, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaMinlength(value: types.SchemaMinlength, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaPattern(value: types.SchemaPattern, path: string[] = []): Iterable<string[]> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield path;
    }
}
export function* validateSchemaAdditionalitems(value: types.SchemaAdditionalitems, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaAdditionalitems0(value: types.SchemaAdditionalitems0, path: string[] = []): Iterable<string[]> {
    if (validation.isValidBooleanType(value)) {
    }
    else {
        yield path;
    }
}
export function* validateSchemaAdditionalitems1(value: types.SchemaAdditionalitems1, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaItems(value: types.SchemaItems, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaItems0(value: types.SchemaItems0, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaItems1(value: types.SchemaItems1, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaMaxitems(value: types.SchemaMaxitems, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaMinitems(value: types.SchemaMinitems, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaUniqueitems(value: types.SchemaUniqueitems, path: string[] = []): Iterable<string[]> {
    if (validation.isValidBooleanType(value)) {
    }
    else {
        yield path;
    }
}
export function* validateSchemaMaxproperties(value: types.SchemaMaxproperties, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaMinproperties(value: types.SchemaMinproperties, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaRequired(value: types.SchemaRequired, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaAdditionalproperties(value: types.SchemaAdditionalproperties, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaAdditionalproperties0(value: types.SchemaAdditionalproperties0, path: string[] = []): Iterable<string[]> {
    if (validation.isValidBooleanType(value)) {
    }
    else {
        yield path;
    }
}
export function* validateSchemaAdditionalproperties1(value: types.SchemaAdditionalproperties1, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaDefinitions(value: types.SchemaDefinitions, path: string[] = []): Iterable<string[]> {
    if (validation.isValidObjectType(value)) {
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateSchemaDefinitionsAdditionalproperties(value, [...path, key]);
        }
    }
    else {
        yield path;
    }
}
export function* validateSchemaDefinitionsAdditionalproperties(value: types.SchemaDefinitionsAdditionalproperties, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaProperties(value: types.SchemaProperties, path: string[] = []): Iterable<string[]> {
    if (validation.isValidObjectType(value)) {
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateSchemaPropertiesAdditionalproperties(value, [...path, key]);
        }
    }
    else {
        yield path;
    }
}
export function* validateSchemaPropertiesAdditionalproperties(value: types.SchemaPropertiesAdditionalproperties, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaPatternproperties(value: types.SchemaPatternproperties, path: string[] = []): Iterable<string[]> {
    if (validation.isValidObjectType(value)) {
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateSchemaPatternpropertiesAdditionalproperties(value, [...path, key]);
        }
    }
    else {
        yield path;
    }
}
export function* validateSchemaPatternpropertiesAdditionalproperties(value: types.SchemaPatternpropertiesAdditionalproperties, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaDependencies(value: types.SchemaDependencies, path: string[] = []): Iterable<string[]> {
    if (validation.isValidObjectType(value)) {
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateSchemaDependenciesAdditionalproperties(value, [...path, key]);
        }
    }
    else {
        yield path;
    }
}
export function* validateSchemaDependenciesAdditionalproperties(value: types.SchemaDependenciesAdditionalproperties, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaDependenciesAdditionalproperties0(value: types.SchemaDependenciesAdditionalproperties0, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaDependenciesAdditionalproperties1(value: types.SchemaDependenciesAdditionalproperties1, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaEnum(value: types.SchemaEnum, path: string[] = []): Iterable<string[]> {
    if (validation.isValidArrayType(value)) {
        if (!validation.isValidMinItems(value, 1)) {
            yield path;
        }
        if (!validation.isValidUniqueItems(value, true)) {
            yield path;
        }
    }
    else {
        yield path;
    }
}
export function* validateSchemaType(value: types.SchemaType, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaType0(value: types.SchemaType0, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaType1(value: types.SchemaType1, path: string[] = []): Iterable<string[]> {
    if (validation.isValidArrayType(value)) {
        if (!validation.isValidMinItems(value, 1)) {
            yield path;
        }
        if (!validation.isValidUniqueItems(value, true)) {
            yield path;
        }
        yield* validateSchemaType1Items(value[0], [...path, "0"]);
    }
    else {
        yield path;
    }
}
export function* validateSchemaType1Items(value: types.SchemaType1Items, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaFormat(value: types.SchemaFormat, path: string[] = []): Iterable<string[]> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield path;
    }
}
export function* validateSchemaAllof(value: types.SchemaAllof, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaAnyof(value: types.SchemaAnyof, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaOneof(value: types.SchemaOneof, path: string[] = []): Iterable<string[]> {
}
export function* validateSchemaNot(value: types.SchemaNot, path: string[] = []): Iterable<string[]> {
}
