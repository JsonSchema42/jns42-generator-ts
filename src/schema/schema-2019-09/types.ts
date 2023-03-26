/* eslint-disable */
export type Schema = ((Schema0 & Schema1 & Schema2 & Schema3 & Schema4 & Schema5) & ({
    definitions?: SchemaDefinitions;
    dependencies?: SchemaDependencies;
} | boolean));
export type SchemaDefinitions = ((Record<string, SchemaDefinitionsAdditionalproperties>));
export type SchemaDefinitionsAdditionalproperties = (Schema);
export type SchemaDependencies = ((Record<string, SchemaDependenciesAdditionalproperties>));
export type SchemaDependenciesAdditionalproperties = ((SchemaDependenciesAdditionalproperties0 | SchemaDependenciesAdditionalproperties1));
export type SchemaDependenciesAdditionalproperties0 = (Schema);
export type SchemaDependenciesAdditionalproperties1 = (ValidationStringarray);
export type Schema0 = (Core);
export type Schema1 = (Applicator);
export type Schema2 = (Validation);
export type Schema3 = (Metadata);
export type Schema4 = (Format);
export type Schema5 = (Content);
export type Validation = (({
    multipleOf?: ValidationMultipleof;
    maximum?: ValidationMaximum;
    exclusiveMaximum?: ValidationExclusivemaximum;
    minimum?: ValidationMinimum;
    exclusiveMinimum?: ValidationExclusiveminimum;
    maxLength?: ValidationMaxlength;
    minLength?: ValidationMinlength;
    pattern?: ValidationPattern;
    maxItems?: ValidationMaxitems;
    minItems?: ValidationMinitems;
    uniqueItems?: ValidationUniqueitems;
    maxContains?: ValidationMaxcontains;
    minContains?: ValidationMincontains;
    maxProperties?: ValidationMaxproperties;
    minProperties?: ValidationMinproperties;
    required?: ValidationRequired;
    dependentRequired?: ValidationDependentrequired;
    const?: ValidationConst;
    enum?: ValidationEnum;
    type?: ValidationType;
} | boolean));
export type ValidationNonnegativeinteger = ((number));
export type ValidationNonnegativeintegerdefault0 = (ValidationNonnegativeinteger);
export type ValidationSimpletypes = (("array" | "boolean" | "integer" | "null" | "number" | "object" | "string"));
export type ValidationStringarray = ((Array<ValidationStringarrayItems>));
export type ValidationStringarrayItems = ((string));
export type ValidationMultipleof = ((number));
export type ValidationMaximum = ((number));
export type ValidationExclusivemaximum = ((number));
export type ValidationMinimum = ((number));
export type ValidationExclusiveminimum = ((number));
export type ValidationMaxlength = (ValidationNonnegativeinteger);
export type ValidationMinlength = (ValidationNonnegativeintegerdefault0);
export type ValidationPattern = ((string));
export type ValidationMaxitems = (ValidationNonnegativeinteger);
export type ValidationMinitems = (ValidationNonnegativeintegerdefault0);
export type ValidationUniqueitems = ((boolean));
export type ValidationMaxcontains = (ValidationNonnegativeinteger);
export type ValidationMincontains = (ValidationNonnegativeinteger);
export type ValidationMaxproperties = (ValidationNonnegativeinteger);
export type ValidationMinproperties = (ValidationNonnegativeintegerdefault0);
export type ValidationRequired = (ValidationStringarray);
export type ValidationDependentrequired = ((Record<string, ValidationDependentrequiredAdditionalproperties>));
export type ValidationDependentrequiredAdditionalproperties = (ValidationStringarray);
export type ValidationConst = (any);
export type ValidationEnum = ((Array<unknown>));
export type ValidationType = ((ValidationType0 | ValidationType1));
export type ValidationType0 = (ValidationSimpletypes);
export type ValidationType1 = ((Array<ValidationType1Items>));
export type ValidationType1Items = (ValidationSimpletypes);
export type Core = (({
    $id?: CoreId;
    $schema?: CoreSchema;
    $anchor?: CoreAnchor;
    $ref?: CoreRef;
    $recursiveRef?: CoreRecursiveref;
    $recursiveAnchor?: CoreRecursiveanchor;
    $vocabulary?: CoreVocabulary;
    $comment?: CoreComment;
    $defs?: CoreDefs;
} | boolean));
export type CoreId = ((string));
export type CoreSchema = ((string));
export type CoreAnchor = ((string));
export type CoreRef = ((string));
export type CoreRecursiveref = ((string));
export type CoreRecursiveanchor = ((boolean));
export type CoreVocabulary = ((Record<string, CoreVocabularyAdditionalproperties>));
export type CoreVocabularyAdditionalproperties = ((boolean));
export type CoreComment = ((string));
export type CoreDefs = ((Record<string, CoreDefsAdditionalproperties>));
export type CoreDefsAdditionalproperties = (Schema);
export type Applicator = (({
    additionalItems?: ApplicatorAdditionalitems;
    unevaluatedItems?: ApplicatorUnevaluateditems;
    items?: ApplicatorItems;
    contains?: ApplicatorContains;
    additionalProperties?: ApplicatorAdditionalproperties;
    unevaluatedProperties?: ApplicatorUnevaluatedproperties;
    properties?: ApplicatorProperties;
    patternProperties?: ApplicatorPatternproperties;
    dependentSchemas?: ApplicatorDependentschemas;
    propertyNames?: ApplicatorPropertynames;
    if?: ApplicatorIf;
    then?: ApplicatorThen;
    else?: ApplicatorElse;
    allOf?: ApplicatorAllof;
    anyOf?: ApplicatorAnyof;
    oneOf?: ApplicatorOneof;
    not?: ApplicatorNot;
} | boolean));
export type ApplicatorSchemaarray = ((Array<ApplicatorSchemaarrayItems>));
export type ApplicatorSchemaarrayItems = (Schema);
export type ApplicatorAdditionalitems = (Schema);
export type ApplicatorUnevaluateditems = (Schema);
export type ApplicatorItems = ((ApplicatorItems0 | ApplicatorItems1));
export type ApplicatorItems0 = (Schema);
export type ApplicatorItems1 = (ApplicatorSchemaarray);
export type ApplicatorContains = (Schema);
export type ApplicatorAdditionalproperties = (Schema);
export type ApplicatorUnevaluatedproperties = (Schema);
export type ApplicatorProperties = ((Record<string, ApplicatorPropertiesAdditionalproperties>));
export type ApplicatorPropertiesAdditionalproperties = (Schema);
export type ApplicatorPatternproperties = ((Record<string, ApplicatorPatternpropertiesAdditionalproperties>));
export type ApplicatorPatternpropertiesAdditionalproperties = (Schema);
export type ApplicatorDependentschemas = ((Record<string, ApplicatorDependentschemasAdditionalproperties>));
export type ApplicatorDependentschemasAdditionalproperties = (Schema);
export type ApplicatorPropertynames = (Schema);
export type ApplicatorIf = (Schema);
export type ApplicatorThen = (Schema);
export type ApplicatorElse = (Schema);
export type ApplicatorAllof = (ApplicatorSchemaarray);
export type ApplicatorAnyof = (ApplicatorSchemaarray);
export type ApplicatorOneof = (ApplicatorSchemaarray);
export type ApplicatorNot = (Schema);
export type Metadata = (({
    title?: MetadataTitle;
    description?: MetadataDescription;
    default?: MetadataDefault;
    deprecated?: MetadataDeprecated;
    readOnly?: MetadataReadonly;
    writeOnly?: MetadataWriteonly;
    examples?: MetadataExamples;
} | boolean));
export type MetadataTitle = ((string));
export type MetadataDescription = ((string));
export type MetadataDefault = (any);
export type MetadataDeprecated = ((boolean));
export type MetadataReadonly = ((boolean));
export type MetadataWriteonly = ((boolean));
export type MetadataExamples = ((Array<unknown>));
export type Format = (({
    format?: FormatFormat;
} | boolean));
export type FormatFormat = ((string));
export type Content = (({
    contentMediaType?: ContentContentmediatype;
    contentEncoding?: ContentContentencoding;
    contentSchema?: ContentContentschema;
} | boolean));
export type ContentContentmediatype = ((string));
export type ContentContentencoding = ((string));
export type ContentContentschema = (Schema);
