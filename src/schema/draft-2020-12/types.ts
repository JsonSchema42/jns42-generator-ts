/* eslint-disable */
/* spellchecker: disable */
export type Schema = ((Schema0 & Schema1 & Schema2 & Schema3 & Schema4 & Schema5 & Schema6) & ({
    definitions?: SchemaDefinitions;
    dependencies?: SchemaDependencies;
    $recursiveAnchor?: SchemaRecursiveanchor;
    $recursiveRef?: SchemaRecursiveref;
} | boolean));
/**
@deprecated
*/
export type SchemaDefinitions = ((Record<string, SchemaDefinitionsAdditionalproperties>));
export type SchemaDefinitionsAdditionalproperties = (Schema);
/**
@deprecated
*/
export type SchemaDependencies = ((Record<string, SchemaDependenciesAdditionalproperties>));
export type SchemaDependenciesAdditionalproperties = ((SchemaDependenciesAdditionalproperties0 | SchemaDependenciesAdditionalproperties1));
export type SchemaDependenciesAdditionalproperties0 = (Schema);
export type SchemaDependenciesAdditionalproperties1 = (ValidationStringarray);
/**
@deprecated
*/
export type SchemaRecursiveanchor = (CoreAnchorstring);
/**
@deprecated
*/
export type SchemaRecursiveref = (CoreUrireferencestring);
export type Schema0 = (Core);
export type Schema1 = (Applicator);
export type Schema2 = (Unevaluated);
export type Schema3 = (Validation);
export type Schema4 = (Metadata);
export type Schema5 = (Formatannotation);
export type Schema6 = (Content);
export type Validation = (({
    type?: ValidationType;
    const?: ValidationConst;
    enum?: ValidationEnum;
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
} | boolean));
export type ValidationNonnegativeinteger = ((number));
export type ValidationNonnegativeintegerdefault0 = (ValidationNonnegativeinteger);
export type ValidationSimpletypes = (("array" | "boolean" | "integer" | "null" | "number" | "object" | "string"));
export type ValidationStringarray = ((Array<ValidationStringarrayItems>));
export type ValidationStringarrayItems = ((string));
export type ValidationType = ((ValidationType0 | ValidationType1));
export type ValidationType0 = (ValidationSimpletypes);
export type ValidationType1 = ((Array<ValidationType1Items>));
export type ValidationType1Items = (ValidationSimpletypes);
export type ValidationConst = (any);
export type ValidationEnum = ((Array<ValidationEnumItems>));
export type ValidationEnumItems = (any);
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
export type Core = (({
    $id?: CoreId;
    $schema?: CoreSchema;
    $ref?: CoreRef;
    $anchor?: CoreAnchor;
    $dynamicRef?: CoreDynamicref;
    $dynamicAnchor?: CoreDynamicanchor;
    $vocabulary?: CoreVocabulary;
    $comment?: CoreComment;
    $defs?: CoreDefs;
} | boolean));
export type CoreAnchorstring = ((string));
export type CoreUristring = ((string));
export type CoreUrireferencestring = ((string));
export type CoreId = (CoreUrireferencestring);
export type CoreSchema = (CoreUristring);
export type CoreRef = (CoreUrireferencestring);
export type CoreAnchor = (CoreAnchorstring);
export type CoreDynamicref = (CoreUrireferencestring);
export type CoreDynamicanchor = (CoreAnchorstring);
export type CoreVocabulary = ((Record<string, CoreVocabularyAdditionalproperties>));
export type CoreVocabularyAdditionalproperties = ((boolean));
export type CoreComment = ((string));
export type CoreDefs = ((Record<string, CoreDefsAdditionalproperties>));
export type CoreDefsAdditionalproperties = (Schema);
export type Applicator = (({
    prefixItems?: ApplicatorPrefixitems;
    items?: ApplicatorItems;
    contains?: ApplicatorContains;
    additionalProperties?: ApplicatorAdditionalproperties;
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
export type ApplicatorPrefixitems = (ApplicatorSchemaarray);
export type ApplicatorItems = (Schema);
export type ApplicatorContains = (Schema);
export type ApplicatorAdditionalproperties = (Schema);
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
export type Unevaluated = (({
    unevaluatedItems?: UnevaluatedUnevaluateditems;
    unevaluatedProperties?: UnevaluatedUnevaluatedproperties;
} | boolean));
export type UnevaluatedUnevaluateditems = (Schema);
export type UnevaluatedUnevaluatedproperties = (Schema);
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
export type MetadataExamples = ((Array<MetadataExamplesItems>));
export type MetadataExamplesItems = (any);
export type Formatannotation = (({
    format?: FormatannotationFormat;
} | boolean));
export type FormatannotationFormat = ((string));
export type Content = (({
    contentEncoding?: ContentContentencoding;
    contentMediaType?: ContentContentmediatype;
    contentSchema?: ContentContentschema;
} | boolean));
export type ContentContentencoding = ((string));
export type ContentContentmediatype = ((string));
export type ContentContentschema = (Schema);
