/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.1.1
 */
export function validateType(
    value: unknown,
    argument: "null" | "array" | "object" | "string" | "number" | "integer" | "boolean",
) {
    switch (argument) {
        case "null":
            return value === null;

        case "array":
            return Array.isArray(value);

        case "object":
            return value !== null && typeof value === "object" && !Array.isArray(value);

        case "string":
            return typeof value === "string";

        case "number":
            return typeof value === "number" && !isNaN(value);

        case "integer":
            return typeof value === "number" && value % 1 === 0 && !isNaN(value);

        case "boolean":
            return typeof value === "boolean";
    }
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.1.2
 */
export function validateEnum(
    value: unknown,
    argument: unknown[],
) {
    for (const expectValue of argument) {
        if (value === expectValue) return true;
    }
    return false;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.1.3
 */
export function validateConst(
    value: unknown,
    argument: unknown,
) {
    return value === argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.2.1
 */
export function validateMultipleOf(
    value: number,
    argument: number,
) {
    return value % argument === 0;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.2.2
 */
export function validateMaximum(
    value: number,
    argument: number,
) {
    return value <= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.2.3
 */
export function validateExclusiveMaximum(
    value: number,
    argument: number,
) {
    return value < argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.2.4
 */
export function validateMinimum(
    value: number,
    argument: number,
) {
    return value >= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.2.5
 */
export function validateExclusiveMinimum(
    value: number,
    argument: number,
) {
    return value > argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.3.1
 */
export function validateMaxLength(
    value: string,
    argument: number,
) {
    return value.length <= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.3.2
 */
export function validateMinLength(
    value: string,
    argument: number,
) {
    return value.length >= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.3.3
 */
export function validatePattern(
    value: string,
    argument: string,
) {
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regExp = new RegExp(argument, "u");
    return regExp.test(value);
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.4.1
 */
export function validateMaxItems(
    value: Array<unknown>,
    argument: number,
) {
    return value.length <= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.4.2
 */
export function validateMinItems(
    value: Array<unknown>,
    argument: number,
) {
    return value.length >= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.4.3
 */
export function validateUniqueItems(
    value: Array<unknown>,
    argument: boolean,
) {
    if (!argument) return true;

    const set = new Set(value);
    return set.size === value.length;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.4.4
 */
export function validateMaxContains(
    value: unknown,
    argument: unknown,
) {
    throw new Error("Not implemented");
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.4.5
 */
export function validateMinContains(
    value: unknown,
    argument: unknown,
) {
    throw new Error("Not implemented");
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.5.1
 */
export function validateMaxProperties(
    value: object,
    argument: number,
) {
    return Object.keys(value).length <= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.5.2
 */
export function validateMinProperties(
    value: object,
    argument: number,
) {
    return Object.keys(value).length >= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.5.3
 */
export function validateRequired<T extends Record<string, unknown>>(
    value: T,
    argument: Array<keyof T>,
) {
    for (const name of argument) {
        if (value[String(name)] === undefined) return false;
    }
    return true;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.5.4
 */
export function validateDependentRequired(
    value: unknown,
    type: string,
) {
    throw new Error("Not implemented");
}

export function* validateAnyOf<E>(
    value: unknown,
    validators: Array<(value: any) => Iterable<E>>,
): Iterable<E> {
    const errorLists = new Array<E[]>();
    for (const validator of validators) {
        errorLists.push([...validator(value)]);
    }
    if (validators.length === errorLists.length) {
        for (const errorList of errorLists) {
            yield* errorList;
        }
    }
}

export function* validateOneOf<E>(
    value: unknown,
    validators: Array<(value: any) => Iterable<E>>,
): Iterable<E> {
    const errorLists = new Array<E[]>();
    for (const validator of validators) {
        errorLists.push([...validator(value)]);
    }
    if (validators.length !== errorLists.length - 1) {
        for (const errorList of errorLists) {
            yield* errorList;
        }
    }
}

export function* validateAllOf<E>(
    value: unknown,
    validators: Array<(value: any) => Iterable<E>>,
): Iterable<E> {
    for (const validator of validators) {
        yield* validator(value);
    }
}
