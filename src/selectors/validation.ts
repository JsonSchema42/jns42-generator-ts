export function selectValidationMaxProperties(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("maxProperties" in node) {
            return node.maxProperties;
        }
    }
}

export function selectValidationMinProperties(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("minProperties" in node) {
            return node.minProperties;
        }
    }
}

export function selectValidationRequired(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("required" in node) {
            return node.required;
        }
    }
}

export function selectValidationMinItems(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("minItems" in node) {
            return node.minItems;
        }
    }
}

export function selectValidationMaxItems(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("maxItems" in node) {
            return node.maxItems;
        }
    }
}

export function selectValidationUniqueItems(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("uniqueItems" in node) {
            return node.uniqueItems;
        }
    }
}

export function selectValidationMinLength(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("minLength" in node) {
            return node.minLength;
        }
    }
}

export function selectValidationMaxLength(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("maxLength" in node) {
            return node.maxLength;
        }
    }
}

export function selectValidationPattern(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("pattern" in node) {
            return node.pattern;
        }
    }
}

export function selectValidationMinimum(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("minimum" in node) {
            return node.minimum;
        }
    }
}

export function selectValidationExclusiveMinimum(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("exclusiveMinimum" in node) {
            return node.exclusiveMinimum;
        }
    }
}

export function selectValidationMaximum(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("maximum" in node) {
            return node.maximum;
        }
    }
}

export function selectValidationExclusiveMaximum(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("exclusiveMaximum" in node) {
            return node.exclusiveMaximum;
        }
    }
}

export function selectValidationMultipleOf(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("multipleOf" in node) {
            return node.multipleOf;
        }
    }
}

export function selectValidationConst(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("const" in node) {
            return node.const;
        }
    }
}

export function selectValidationEnum(
    node: unknown,
) {
    if (node != null && typeof node === "object") {
        if ("enum" in node) {
            return node.enum;
        }
    }
}
