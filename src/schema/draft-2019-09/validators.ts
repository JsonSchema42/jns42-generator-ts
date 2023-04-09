/* eslint-disable */
/* spellchecker: disable */
import * as validation from "../../includes/validation.js";
import * as types from "./types.js";
export function* validateSchema(value: types.Schema, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidBooleanType(value)) {
    }
    else if (validation.isValidObjectType(value)) {
        if (value["definitions"] !== undefined) {
            yield* validateSchemaDefinitions(value["definitions"], [...path, "definitions"]);
        }
        if (value["dependencies"] !== undefined) {
            yield* validateSchemaDependencies(value["dependencies"], [...path, "dependencies"]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateSchemaDefinitions(value: types.SchemaDefinitions, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidObjectType(value)) {
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateSchemaDefinitionsAdditionalproperties(value, [...path, key]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateSchemaDefinitionsAdditionalproperties(value: types.SchemaDefinitionsAdditionalproperties, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateSchemaDependencies(value: types.SchemaDependencies, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidObjectType(value)) {
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateSchemaDependenciesAdditionalproperties(value, [...path, key]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateSchemaDependenciesAdditionalproperties(value: types.SchemaDependenciesAdditionalproperties, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateSchemaDependenciesAdditionalproperties0(value: types.SchemaDependenciesAdditionalproperties0, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateSchemaDependenciesAdditionalproperties1(value: types.SchemaDependenciesAdditionalproperties1, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateSchema0(value: types.Schema0, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateSchema1(value: types.Schema1, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateSchema2(value: types.Schema2, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateSchema3(value: types.Schema3, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateSchema4(value: types.Schema4, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateSchema5(value: types.Schema5, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidation(value: types.Validation, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidBooleanType(value)) {
    }
    else if (validation.isValidObjectType(value)) {
        if (value["multipleOf"] !== undefined) {
            yield* validateValidationMultipleof(value["multipleOf"], [...path, "multipleOf"]);
        }
        if (value["maximum"] !== undefined) {
            yield* validateValidationMaximum(value["maximum"], [...path, "maximum"]);
        }
        if (value["exclusiveMaximum"] !== undefined) {
            yield* validateValidationExclusivemaximum(value["exclusiveMaximum"], [...path, "exclusiveMaximum"]);
        }
        if (value["minimum"] !== undefined) {
            yield* validateValidationMinimum(value["minimum"], [...path, "minimum"]);
        }
        if (value["exclusiveMinimum"] !== undefined) {
            yield* validateValidationExclusiveminimum(value["exclusiveMinimum"], [...path, "exclusiveMinimum"]);
        }
        if (value["maxLength"] !== undefined) {
            yield* validateValidationMaxlength(value["maxLength"], [...path, "maxLength"]);
        }
        if (value["minLength"] !== undefined) {
            yield* validateValidationMinlength(value["minLength"], [...path, "minLength"]);
        }
        if (value["pattern"] !== undefined) {
            yield* validateValidationPattern(value["pattern"], [...path, "pattern"]);
        }
        if (value["maxItems"] !== undefined) {
            yield* validateValidationMaxitems(value["maxItems"], [...path, "maxItems"]);
        }
        if (value["minItems"] !== undefined) {
            yield* validateValidationMinitems(value["minItems"], [...path, "minItems"]);
        }
        if (value["uniqueItems"] !== undefined) {
            yield* validateValidationUniqueitems(value["uniqueItems"], [...path, "uniqueItems"]);
        }
        if (value["maxContains"] !== undefined) {
            yield* validateValidationMaxcontains(value["maxContains"], [...path, "maxContains"]);
        }
        if (value["minContains"] !== undefined) {
            yield* validateValidationMincontains(value["minContains"], [...path, "minContains"]);
        }
        if (value["maxProperties"] !== undefined) {
            yield* validateValidationMaxproperties(value["maxProperties"], [...path, "maxProperties"]);
        }
        if (value["minProperties"] !== undefined) {
            yield* validateValidationMinproperties(value["minProperties"], [...path, "minProperties"]);
        }
        if (value["required"] !== undefined) {
            yield* validateValidationRequired(value["required"], [...path, "required"]);
        }
        if (value["dependentRequired"] !== undefined) {
            yield* validateValidationDependentrequired(value["dependentRequired"], [...path, "dependentRequired"]);
        }
        if (value["const"] !== undefined) {
            yield* validateValidationConst(value["const"], [...path, "const"]);
        }
        if (value["enum"] !== undefined) {
            yield* validateValidationEnum(value["enum"], [...path, "enum"]);
        }
        if (value["type"] !== undefined) {
            yield* validateValidationType(value["type"], [...path, "type"]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateValidationNonnegativeinteger(value: types.ValidationNonnegativeinteger, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidIntegerType(value)) {
        if (!validation.isValidMinimum(value, 0)) {
            yield { path, error: "minimum" };
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateValidationNonnegativeintegerdefault0(value: types.ValidationNonnegativeintegerdefault0, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationSimpletypes(value: types.ValidationSimpletypes, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationStringarray(value: types.ValidationStringarray, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidArrayType(value)) {
        if (!validation.isValidUniqueItems(value, true)) {
            yield { path, error: "unique-items" };
        }
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateValidationStringarrayItems(value, [...path, key]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateValidationStringarrayItems(value: types.ValidationStringarrayItems, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateValidationMultipleof(value: types.ValidationMultipleof, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidNumberType(value)) {
        if (!validation.isValidExclusiveMinimum(value, 0)) {
            yield { path, error: "exclusive-minimum" };
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateValidationMaximum(value: types.ValidationMaximum, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidNumberType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateValidationExclusivemaximum(value: types.ValidationExclusivemaximum, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidNumberType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateValidationMinimum(value: types.ValidationMinimum, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidNumberType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateValidationExclusiveminimum(value: types.ValidationExclusiveminimum, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidNumberType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateValidationMaxlength(value: types.ValidationMaxlength, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationMinlength(value: types.ValidationMinlength, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationPattern(value: types.ValidationPattern, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateValidationMaxitems(value: types.ValidationMaxitems, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationMinitems(value: types.ValidationMinitems, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationUniqueitems(value: types.ValidationUniqueitems, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidBooleanType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateValidationMaxcontains(value: types.ValidationMaxcontains, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationMincontains(value: types.ValidationMincontains, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationMaxproperties(value: types.ValidationMaxproperties, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationMinproperties(value: types.ValidationMinproperties, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationRequired(value: types.ValidationRequired, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationDependentrequired(value: types.ValidationDependentrequired, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidObjectType(value)) {
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateValidationDependentrequiredAdditionalproperties(value, [...path, key]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateValidationDependentrequiredAdditionalproperties(value: types.ValidationDependentrequiredAdditionalproperties, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationConst(value: types.ValidationConst, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationEnum(value: types.ValidationEnum, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidArrayType(value)) {
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateValidationEnumItems(value, [...path, key]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateValidationEnumItems(value: types.ValidationEnumItems, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationType(value: types.ValidationType, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationType0(value: types.ValidationType0, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateValidationType1(value: types.ValidationType1, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidArrayType(value)) {
        if (!validation.isValidMinItems(value, 1)) {
            yield { path, error: "min-items" };
        }
        if (!validation.isValidUniqueItems(value, true)) {
            yield { path, error: "unique-items" };
        }
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateValidationType1Items(value, [...path, key]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateValidationType1Items(value: types.ValidationType1Items, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateCore(value: types.Core, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidBooleanType(value)) {
    }
    else if (validation.isValidObjectType(value)) {
        if (value["$id"] !== undefined) {
            yield* validateCoreId(value["$id"], [...path, "$id"]);
        }
        if (value["$schema"] !== undefined) {
            yield* validateCoreSchema(value["$schema"], [...path, "$schema"]);
        }
        if (value["$anchor"] !== undefined) {
            yield* validateCoreAnchor(value["$anchor"], [...path, "$anchor"]);
        }
        if (value["$ref"] !== undefined) {
            yield* validateCoreRef(value["$ref"], [...path, "$ref"]);
        }
        if (value["$recursiveRef"] !== undefined) {
            yield* validateCoreRecursiveref(value["$recursiveRef"], [...path, "$recursiveRef"]);
        }
        if (value["$recursiveAnchor"] !== undefined) {
            yield* validateCoreRecursiveanchor(value["$recursiveAnchor"], [...path, "$recursiveAnchor"]);
        }
        if (value["$vocabulary"] !== undefined) {
            yield* validateCoreVocabulary(value["$vocabulary"], [...path, "$vocabulary"]);
        }
        if (value["$comment"] !== undefined) {
            yield* validateCoreComment(value["$comment"], [...path, "$comment"]);
        }
        if (value["$defs"] !== undefined) {
            yield* validateCoreDefs(value["$defs"], [...path, "$defs"]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateCoreId(value: types.CoreId, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidStringType(value)) {
        if (!validation.isValidPattern(value, "^[^#]*#?$")) {
            yield { path, error: "pattern" };
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateCoreSchema(value: types.CoreSchema, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateCoreAnchor(value: types.CoreAnchor, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidStringType(value)) {
        if (!validation.isValidPattern(value, "^[A-Za-z][-A-Za-z0-9.:_]*$")) {
            yield { path, error: "pattern" };
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateCoreRef(value: types.CoreRef, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateCoreRecursiveref(value: types.CoreRecursiveref, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateCoreRecursiveanchor(value: types.CoreRecursiveanchor, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidBooleanType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateCoreVocabulary(value: types.CoreVocabulary, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidObjectType(value)) {
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateCoreVocabularyAdditionalproperties(value, [...path, key]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateCoreVocabularyAdditionalproperties(value: types.CoreVocabularyAdditionalproperties, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidBooleanType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateCoreComment(value: types.CoreComment, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateCoreDefs(value: types.CoreDefs, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidObjectType(value)) {
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateCoreDefsAdditionalproperties(value, [...path, key]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateCoreDefsAdditionalproperties(value: types.CoreDefsAdditionalproperties, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicator(value: types.Applicator, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidBooleanType(value)) {
    }
    else if (validation.isValidObjectType(value)) {
        if (value["additionalItems"] !== undefined) {
            yield* validateApplicatorAdditionalitems(value["additionalItems"], [...path, "additionalItems"]);
        }
        if (value["unevaluatedItems"] !== undefined) {
            yield* validateApplicatorUnevaluateditems(value["unevaluatedItems"], [...path, "unevaluatedItems"]);
        }
        if (value["items"] !== undefined) {
            yield* validateApplicatorItems(value["items"], [...path, "items"]);
        }
        if (value["contains"] !== undefined) {
            yield* validateApplicatorContains(value["contains"], [...path, "contains"]);
        }
        if (value["additionalProperties"] !== undefined) {
            yield* validateApplicatorAdditionalproperties(value["additionalProperties"], [...path, "additionalProperties"]);
        }
        if (value["unevaluatedProperties"] !== undefined) {
            yield* validateApplicatorUnevaluatedproperties(value["unevaluatedProperties"], [...path, "unevaluatedProperties"]);
        }
        if (value["properties"] !== undefined) {
            yield* validateApplicatorProperties(value["properties"], [...path, "properties"]);
        }
        if (value["patternProperties"] !== undefined) {
            yield* validateApplicatorPatternproperties(value["patternProperties"], [...path, "patternProperties"]);
        }
        if (value["dependentSchemas"] !== undefined) {
            yield* validateApplicatorDependentschemas(value["dependentSchemas"], [...path, "dependentSchemas"]);
        }
        if (value["propertyNames"] !== undefined) {
            yield* validateApplicatorPropertynames(value["propertyNames"], [...path, "propertyNames"]);
        }
        if (value["if"] !== undefined) {
            yield* validateApplicatorIf(value["if"], [...path, "if"]);
        }
        if (value["then"] !== undefined) {
            yield* validateApplicatorThen(value["then"], [...path, "then"]);
        }
        if (value["else"] !== undefined) {
            yield* validateApplicatorElse(value["else"], [...path, "else"]);
        }
        if (value["allOf"] !== undefined) {
            yield* validateApplicatorAllof(value["allOf"], [...path, "allOf"]);
        }
        if (value["anyOf"] !== undefined) {
            yield* validateApplicatorAnyof(value["anyOf"], [...path, "anyOf"]);
        }
        if (value["oneOf"] !== undefined) {
            yield* validateApplicatorOneof(value["oneOf"], [...path, "oneOf"]);
        }
        if (value["not"] !== undefined) {
            yield* validateApplicatorNot(value["not"], [...path, "not"]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateApplicatorSchemaarray(value: types.ApplicatorSchemaarray, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidArrayType(value)) {
        if (!validation.isValidMinItems(value, 1)) {
            yield { path, error: "min-items" };
        }
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateApplicatorSchemaarrayItems(value, [...path, key]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateApplicatorSchemaarrayItems(value: types.ApplicatorSchemaarrayItems, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorAdditionalitems(value: types.ApplicatorAdditionalitems, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorUnevaluateditems(value: types.ApplicatorUnevaluateditems, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorItems(value: types.ApplicatorItems, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorItems0(value: types.ApplicatorItems0, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorItems1(value: types.ApplicatorItems1, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorContains(value: types.ApplicatorContains, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorAdditionalproperties(value: types.ApplicatorAdditionalproperties, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorUnevaluatedproperties(value: types.ApplicatorUnevaluatedproperties, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorProperties(value: types.ApplicatorProperties, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidObjectType(value)) {
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateApplicatorPropertiesAdditionalproperties(value, [...path, key]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateApplicatorPropertiesAdditionalproperties(value: types.ApplicatorPropertiesAdditionalproperties, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorPatternproperties(value: types.ApplicatorPatternproperties, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidObjectType(value)) {
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateApplicatorPatternpropertiesAdditionalproperties(value, [...path, key]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateApplicatorPatternpropertiesAdditionalproperties(value: types.ApplicatorPatternpropertiesAdditionalproperties, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorDependentschemas(value: types.ApplicatorDependentschemas, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidObjectType(value)) {
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateApplicatorDependentschemasAdditionalproperties(value, [...path, key]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateApplicatorDependentschemasAdditionalproperties(value: types.ApplicatorDependentschemasAdditionalproperties, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorPropertynames(value: types.ApplicatorPropertynames, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorIf(value: types.ApplicatorIf, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorThen(value: types.ApplicatorThen, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorElse(value: types.ApplicatorElse, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorAllof(value: types.ApplicatorAllof, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorAnyof(value: types.ApplicatorAnyof, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorOneof(value: types.ApplicatorOneof, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateApplicatorNot(value: types.ApplicatorNot, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateMetadata(value: types.Metadata, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidBooleanType(value)) {
    }
    else if (validation.isValidObjectType(value)) {
        if (value["title"] !== undefined) {
            yield* validateMetadataTitle(value["title"], [...path, "title"]);
        }
        if (value["description"] !== undefined) {
            yield* validateMetadataDescription(value["description"], [...path, "description"]);
        }
        if (value["default"] !== undefined) {
            yield* validateMetadataDefault(value["default"], [...path, "default"]);
        }
        if (value["deprecated"] !== undefined) {
            yield* validateMetadataDeprecated(value["deprecated"], [...path, "deprecated"]);
        }
        if (value["readOnly"] !== undefined) {
            yield* validateMetadataReadonly(value["readOnly"], [...path, "readOnly"]);
        }
        if (value["writeOnly"] !== undefined) {
            yield* validateMetadataWriteonly(value["writeOnly"], [...path, "writeOnly"]);
        }
        if (value["examples"] !== undefined) {
            yield* validateMetadataExamples(value["examples"], [...path, "examples"]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateMetadataTitle(value: types.MetadataTitle, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateMetadataDescription(value: types.MetadataDescription, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateMetadataDefault(value: types.MetadataDefault, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateMetadataDeprecated(value: types.MetadataDeprecated, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidBooleanType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateMetadataReadonly(value: types.MetadataReadonly, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidBooleanType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateMetadataWriteonly(value: types.MetadataWriteonly, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidBooleanType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateMetadataExamples(value: types.MetadataExamples, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidArrayType(value)) {
        for (const entry of Object.entries(value)) {
            const [key, value] = entry;
            yield* validateMetadataExamplesItems(value, [...path, key]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateMetadataExamplesItems(value: types.MetadataExamplesItems, path: string[] = []): Iterable<validation.PathError> {
}
export function* validateFormat(value: types.Format, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidBooleanType(value)) {
    }
    else if (validation.isValidObjectType(value)) {
        if (value["format"] !== undefined) {
            yield* validateFormatFormat(value["format"], [...path, "format"]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateFormatFormat(value: types.FormatFormat, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateContent(value: types.Content, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidBooleanType(value)) {
    }
    else if (validation.isValidObjectType(value)) {
        if (value["contentMediaType"] !== undefined) {
            yield* validateContentContentmediatype(value["contentMediaType"], [...path, "contentMediaType"]);
        }
        if (value["contentEncoding"] !== undefined) {
            yield* validateContentContentencoding(value["contentEncoding"], [...path, "contentEncoding"]);
        }
        if (value["contentSchema"] !== undefined) {
            yield* validateContentContentschema(value["contentSchema"], [...path, "contentSchema"]);
        }
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateContentContentmediatype(value: types.ContentContentmediatype, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateContentContentencoding(value: types.ContentContentencoding, path: string[] = []): Iterable<validation.PathError> {
    if (validation.isValidStringType(value)) {
    }
    else {
        yield { path, error: "type" };
    }
}
export function* validateContentContentschema(value: types.ContentContentschema, path: string[] = []): Iterable<validation.PathError> {
}
