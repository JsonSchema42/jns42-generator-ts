/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.1.1
 */

export function isValidNullType(
    value: unknown,
): value is null {
    return value === null;
}

export function isValidArrayType(
    value: unknown,
): value is Array<unknown> {
    return Array.isArray(value);
}

export function isValidObjectType(
    value: unknown,
): value is object {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isValidStringType(
    value: unknown,
): value is object {
    return typeof value === "string";
}

export function isValidNumberType(
    value: unknown,
): value is number {
    return typeof value === "number" && !isNaN(value);
}

export function isValidIntegerType(
    value: unknown,
): value is number {
    return typeof value === "number" && value % 1 === 0 && !isNaN(value);
}

export function isValidBooleanType(
    value: unknown,
): value is boolean {
    return typeof value === "boolean";
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.1.2
 */
export function isValidEnum(
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
export function isValidConst(
    value: unknown,
    argument: unknown,
) {
    return value === argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.2.1
 */
export function isValidMultipleOf(
    value: number,
    argument: number,
) {
    return value % argument === 0;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.2.2
 */
export function isValidMaximum(
    value: number,
    argument: number,
) {
    return value <= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.2.3
 */
export function isValidExclusiveMaximum(
    value: number,
    argument: number,
) {
    return value < argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.2.4
 */
export function isValidMinimum(
    value: number,
    argument: number,
) {
    return value >= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.2.5
 */
export function isValidExclusiveMinimum(
    value: number,
    argument: number,
) {
    return value > argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.3.1
 */
export function isValidMaxLength(
    value: string,
    argument: number,
) {
    return value.length <= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.3.2
 */
export function isValidMinLength(
    value: string,
    argument: number,
) {
    return value.length >= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.3.3
 */
export function isValidPattern(
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
export function isValidMaxItems(
    value: Array<unknown>,
    argument: number,
) {
    return value.length <= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.4.2
 */
export function isValidMinItems(
    value: Array<unknown>,
    argument: number,
) {
    return value.length >= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.4.3
 */
export function isValidUniqueItems(
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
export function isValidMaxContains(
    value: unknown,
    argument: unknown,
) {
    throw new Error("Not implemented");
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.4.5
 */
export function isValidMinContains(
    value: unknown,
    argument: unknown,
) {
    throw new Error("Not implemented");
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.5.1
 */
export function isValidMaxProperties(
    value: object,
    argument: number,
) {
    return Object.keys(value).length <= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.5.2
 */
export function isValidMinProperties(
    value: object,
    argument: number,
) {
    return Object.keys(value).length >= argument;
}

/**
 * 
 * @see https://json-schema.org/draft/2020-12/json-schema-validation.html#rfc.section.6.5.3
 */
export function isValidRequired<T extends Record<string, unknown>>(
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
export function isValidDependentRequired(
    value: unknown,
    type: string,
) {
    throw new Error("Not implemented");
}

export function* validateAnyOf<E>(
    value: unknown,
    validators: Array<(value: any, path: string[]) => Iterable<E>>,
    path: string[],
): Iterable<E> {
    const errorLists = new Array<E[]>();
    for (const validator of validators) {
        errorLists.push([...validator(value, path)]);
    }
    if (validators.length === errorLists.length) {
        for (const errorList of errorLists) {
            yield* errorList;
        }
    }
}

export function* validateOneOf<E>(
    value: unknown,
    validators: Array<(value: any, path: string[]) => Iterable<E>>,
    path: string[],
): Iterable<E> {
    const errorLists = new Array<E[]>();
    for (const validator of validators) {
        errorLists.push([...validator(value, path)]);
    }
    if (validators.length !== errorLists.length - 1) {
        for (const errorList of errorLists) {
            yield* errorList;
        }
    }
}

export function* validateAllOf<E>(
    value: unknown,
    validators: Array<(value: any, path: string[]) => Iterable<E>>,
    path: string[],
): Iterable<E> {
    for (const validator of validators) {
        yield* validator(value, path);
    }
}
