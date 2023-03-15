export function* selectNodeDefEntries(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "$defs" in node &&
            node.$defs != null && typeof node.$defs === "object"
        ) {
            for (const [key, subNode] of Object.entries(node.$defs)) {
                const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/$defs/${encodeURI(key)}`, nodeUrl);
                yield [subNodeUrl, subNode] as const;
            }
        }
    }
}

export function* selectNodePropertyEntries(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "properties" in node &&
            node.properties != null && typeof node.properties === "object"
        ) {
            for (const [key, subNode] of Object.entries(node.properties)) {
                const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/properties/${encodeURI(key)}`, nodeUrl);
                yield [subNodeUrl, subNode] as const;
            }
        }
    }
}

export function* selectNodeAdditionalPropertyEntries(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "additionalProperties" in node &&
            (
                node.additionalProperties != null && typeof node.additionalProperties === "object" ||
                typeof node.additionalProperties === "boolean"
            )

        ) {
            const subNode = node.additionalProperties;
            const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/additionalProperties`, nodeUrl);
            yield [subNodeUrl, subNode] as const;
        }
    }
}

export function* selectNodePrefixItemEntries(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "prefixItems" in node &&
            Array.isArray(node.prefixItems)
        ) {
            for (const [key, subNode] of Object.entries(node.prefixItems)) {
                const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/prefixItems/${encodeURI(key)}`, nodeUrl);
                yield [subNodeUrl, subNode] as const;
            }
        }
    }
}

export function* selectNodeItemEntries(
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
                typeof node.items === "object" && node.items != null ||
                typeof node.items === "boolean"
            )
        ) {
            const subNode = node.items;
            const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/items`, nodeUrl);
            yield [subNodeUrl, subNode] as const;
        }
    }
}

export function* selectNodeAnyOfEntries(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "anyOf" in node &&
            Array.isArray(node.anyOf)
        ) {
            for (const [key, subNode] of Object.entries(node.anyOf)) {
                const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/anyOf/${encodeURI(key)}`, nodeUrl);
                yield [subNodeUrl, subNode] as const;
            }
        }
    }
}

export function* selectNodeOneOfEntries(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "oneOf" in node &&
            Array.isArray(node.oneOf)
        ) {
            for (const [key, subNode] of Object.entries(node.oneOf)) {
                const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/oneOf/${encodeURI(key)}`, nodeUrl);
                yield [subNodeUrl, subNode] as const;
            }
        }
    }
}

export function* selectNodeAllOfEntries(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        if (
            "allOf" in node &&
            Array.isArray(node.allOf)
        ) {
            for (const [key, subNode] of Object.entries(node.allOf)) {
                const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/allOf/${encodeURI(key)}`, nodeUrl);
                yield [subNodeUrl, subNode] as const;
            }
        }
    }
}

export function* selectNodeInstanceEntries(
    nodeUrl: URL,
    node: unknown,
) {
    yield* selectNodeDefEntries(nodeUrl, node);
    yield* selectNodePropertyEntries(nodeUrl, node);
    yield* selectNodeAdditionalPropertyEntries(nodeUrl, node);
    yield* selectNodePrefixItemEntries(nodeUrl, node);
    yield* selectNodeItemEntries(nodeUrl, node);
    yield* selectNodeAllOfEntries(nodeUrl, node);
    yield* selectNodeAnyOfEntries(nodeUrl, node);
    yield* selectNodeOneOfEntries(nodeUrl, node);
}

