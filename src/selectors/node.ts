
export function selectNodeIdUrl(
    node: unknown,
) {
    if (
        typeof node === "object" &&
        node != null
    ) {
        if (
            "$id" in node &&
            typeof node.$id === "string"
        ) {
            return new URL(node.$id);
        }
    }
}

export function selectNodeAnchorUrl(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        typeof node === "object" &&
        node != null
    ) {
        if (
            "$anchor" in node &&
            typeof node.$anchor === "string"
        ) {
            return new URL(`#${node.$anchor}`, nodeUrl);
        }
    }
}

export function selectNodeDynamicAnchorUrl(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        typeof node === "object" &&
        node != null
    ) {
        if (
            "$dynamicAnchor" in node &&
            typeof node.$dynamicAnchor === "string"
        ) {
            return new URL(`#${node.$dynamicAnchor}`, nodeUrl);
        }
    }
}

export function selectNodeRefUrl(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        typeof node === "object" &&
        node != null
    ) {
        if (
            "$ref" in node &&
            typeof node.$ref === "string"
        ) {
            return new URL(node.$ref, nodeUrl);
        }
    }
}

export function selectNodeDynamicRefUrl(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        typeof node === "object" &&
        node != null
    ) {
        if (
            "$dynamicRef" in node &&
            typeof node.$dynamicRef === "string"
        ) {
            return new URL(node.$dynamicRef, nodeUrl);
        }
    }
}

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
            node.$defs != null &&
            typeof node.$defs === "object"
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
            node.properties != null &&
            typeof node.properties === "object"
        ) {
            for (const [key, subNode] of Object.entries(node.properties)) {
                const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/properties/${encodeURI(key)}`, nodeUrl);
                yield [subNodeUrl, subNode, key] as const;
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
            node.additionalProperties != null &&
            typeof node.additionalProperties === "object"
        ) {
            const subNode = node.additionalProperties;
            const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/additionalProperties`, nodeUrl);
            yield [subNodeUrl, subNode] as const;
        }
        else if (
            "additionalProperties" in node &&
            node.additionalProperties === true
        ) {
            const subNode = node.additionalProperties;
            const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/additionalProperties`, nodeUrl);
            yield [subNodeUrl, subNode] as const;
        }
        else if (
            "additionalProperties" in node &&
            node.additionalProperties === false
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
        else if (
            "prefixItems" in node &&
            typeof node.prefixItems === "object" &&
            node.prefixItems != null
        ) {
            const subNode = node.prefixItems;
            const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/prefixItems`, nodeUrl);
            yield [subNodeUrl, subNode] as const;
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
            Array.isArray(node.items)
        ) {
            for (const [key, subNode] of Object.entries(node.items)) {
                const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/items/${encodeURI(key)}`, nodeUrl);
                yield [subNodeUrl, subNode] as const;
            }
        }
        else if (
            "items" in node &&
            typeof node.items === "object" &&
            node.items != null
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
