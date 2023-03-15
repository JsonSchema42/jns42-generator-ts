export function selectNodeType(
    node: unknown,
) {
    if (
        typeof node === "object" &&
        node != null
    ) {
        if (
            "type" in node &&
            typeof node.type === "string"
        ) {
            return [node.type];
        }
        else if (
            "type" in node &&
            Array.isArray(node.type) &&
            node.type.every(type => typeof type === "string")
        ) {
            return node.type as string[];
        }
    }
}

export function selectNodeRequiredProperties(
    node: unknown,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "required" in node &&
            Array.isArray(node.required) &&
            node.required.every(type => typeof type === "string")
        ) {
            return node.required as string[];
        }
    }
}

export function selectNodeProperties(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "properties" in node &&
            node.properties != null &&
            typeof node.properties === "object"
        ) {
            return Object.keys(node.properties).map(key => [
                key,
                new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/properties/${encodeURI(key)}`, nodeUrl),
            ] as const);
        }
    }
}

export function selectNodeAdditionalPropertiesUrl(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "additionalProperties" in node &&
            node.additionalProperties != null &&
            typeof node.additionalProperties === "object"
        ) {
            return new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/additionalProperties`, nodeUrl);
        }
    }

}

export function selectNodeItemsUrl(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "items" in node &&
            (
                node.items != null && typeof node.items === "object" ||
                typeof node.items === "boolean"
            )

        ) {
            return new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/items`, nodeUrl);
        }
    }
}

export function selectNodePrefixItemsUrls(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "prefixItems" in node &&
            node.prefixItems != null && Array.isArray(node.prefixItems)
        ) {
            return Object.entries(node.prefixItems).map(([key]) =>
                new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/prefixItems/${encodeURI(key)}`, nodeUrl),
            );

        }
    }
}

export function selectNodeEnum(
    node: unknown,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "enum" in node &&
            node.enum != null &&
            Array.isArray(node.enum)
        ) {
            return node.enum;
        }
    }
}

export function selectNodeConst(
    node: unknown,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "const" in node &&
            node.const != null
        ) {
            return node.const;
        }
    }
}
