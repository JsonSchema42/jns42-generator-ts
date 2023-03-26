/* eslint-disable */
export type Schema = (({
    $id?: SchemaId;
    $schema?: SchemaSchema;
    $ref?: SchemaRef;
    $comment?: SchemaComment;
    title?: SchemaTitle;
    description?: SchemaDescription;
    default?: SchemaDefault;
    readOnly?: SchemaReadonly;
    writeOnly?: SchemaWriteonly;
    examples?: SchemaExamples;
    multipleOf?: SchemaMultipleof;
    maximum?: SchemaMaximum;
    exclusiveMaximum?: SchemaExclusivemaximum;
    minimum?: SchemaMinimum;
    exclusiveMinimum?: SchemaExclusiveminimum;
    maxLength?: SchemaMaxlength;
    minLength?: SchemaMinlength;
    pattern?: SchemaPattern;
    additionalItems?: SchemaAdditionalitems;
    items?: SchemaItems;
    maxItems?: SchemaMaxitems;
    minItems?: SchemaMinitems;
    uniqueItems?: SchemaUniqueitems;
    contains?: SchemaContains;
    maxProperties?: SchemaMaxproperties;
    minProperties?: SchemaMinproperties;
    required?: SchemaRequired;
    additionalProperties?: SchemaAdditionalproperties;
    definitions?: SchemaDefinitions;
    properties?: SchemaProperties;
    patternProperties?: SchemaPatternproperties;
    dependencies?: SchemaDependencies;
    propertyNames?: SchemaPropertynames;
    const?: SchemaConst;
    enum?: SchemaEnum;
    type?: SchemaType;
    format?: SchemaFormat;
    contentMediaType?: SchemaContentmediatype;
    contentEncoding?: SchemaContentencoding;
    if?: SchemaIf;
    then?: SchemaThen;
    else?: SchemaElse;
    allOf?: SchemaAllof;
    anyOf?: SchemaAnyof;
    oneOf?: SchemaOneof;
    not?: SchemaNot;
} | boolean));
export type SchemaSchemaarray = ((Array<SchemaSchemaarrayRef>));
export type SchemaSchemaarrayRef = unknown;
export type SchemaNonnegativeinteger = ((number));
export type SchemaNonnegativeintegerdefault0 = ((SchemaNonnegativeintegerdefault00 & SchemaNonnegativeintegerdefault01));
export type SchemaNonnegativeintegerdefault00 = (SchemaNonnegativeinteger);
export type SchemaNonnegativeintegerdefault01 = unknown;
export type SchemaSimpletypes = (("array" | "boolean" | "integer" | "null" | "number" | "object" | "string"));
export type SchemaStringarray = ((Array<SchemaStringarrayType>));
export type SchemaStringarrayType = unknown;
export type SchemaId = ((string));
export type SchemaSchema = ((string));
export type SchemaRef = ((string));
export type SchemaComment = ((string));
export type SchemaTitle = ((string));
export type SchemaDescription = ((string));
export type SchemaDefault = (any);
export type SchemaReadonly = ((boolean));
export type SchemaWriteonly = ((boolean));
export type SchemaExamples = ((Array<unknown>));
export type SchemaMultipleof = ((number));
export type SchemaMaximum = ((number));
export type SchemaExclusivemaximum = ((number));
export type SchemaMinimum = ((number));
export type SchemaExclusiveminimum = ((number));
export type SchemaMaxlength = (SchemaNonnegativeinteger);
export type SchemaMinlength = (SchemaNonnegativeintegerdefault0);
export type SchemaPattern = ((string));
export type SchemaAdditionalitems = (Schema);
export type SchemaItems = ((SchemaItems0 | SchemaItems1));
export type SchemaItems0 = (Schema);
export type SchemaItems1 = (SchemaSchemaarray);
export type SchemaMaxitems = (SchemaNonnegativeinteger);
export type SchemaMinitems = (SchemaNonnegativeintegerdefault0);
export type SchemaUniqueitems = ((boolean));
export type SchemaContains = (Schema);
export type SchemaMaxproperties = (SchemaNonnegativeinteger);
export type SchemaMinproperties = (SchemaNonnegativeintegerdefault0);
export type SchemaRequired = (SchemaStringarray);
export type SchemaAdditionalproperties = (Schema);
export type SchemaDefinitions = ((Record<string, SchemaDefinitionsAdditionalproperties>));
export type SchemaDefinitionsAdditionalproperties = (Schema);
export type SchemaProperties = ((Record<string, SchemaPropertiesAdditionalproperties>));
export type SchemaPropertiesAdditionalproperties = (Schema);
export type SchemaPatternproperties = ((Record<string, SchemaPatternpropertiesAdditionalproperties>));
export type SchemaPatternpropertiesAdditionalproperties = (Schema);
export type SchemaDependencies = ((Record<string, SchemaDependenciesAdditionalproperties>));
export type SchemaDependenciesAdditionalproperties = ((SchemaDependenciesAdditionalproperties0 | SchemaDependenciesAdditionalproperties1));
export type SchemaDependenciesAdditionalproperties0 = (Schema);
export type SchemaDependenciesAdditionalproperties1 = (SchemaStringarray);
export type SchemaPropertynames = (Schema);
export type SchemaConst = (any);
export type SchemaEnum = ((Array<unknown>));
export type SchemaType = ((SchemaType0 | SchemaType1));
export type SchemaType0 = (SchemaSimpletypes);
export type SchemaType1 = ((Array<SchemaType1Ref>));
export type SchemaType1Ref = unknown;
export type SchemaFormat = ((string));
export type SchemaContentmediatype = ((string));
export type SchemaContentencoding = ((string));
export type SchemaIf = (Schema);
export type SchemaThen = (Schema);
export type SchemaElse = (Schema);
export type SchemaAllof = (SchemaSchemaarray);
export type SchemaAnyof = (SchemaSchemaarray);
export type SchemaOneof = (SchemaSchemaarray);
export type SchemaNot = (Schema);
