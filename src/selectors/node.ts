export function selectNodeId(
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

export function selectNodeRef(
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
            return node.$ref;
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
            return node.type;
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

export function* selectNodeChildEntries(
    nodeUrl: URL,
    node: unknown,
) {
    if (
        node != null &&
        typeof node === "object"
    ) {
        for (const [key, subNode] of Object.entries(node)) {
            const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/${encodeURI(key)}`, nodeUrl);
            yield [subNodeUrl, subNode] as const;
        }
    }
}

export function selectNodeUnrefUrl(
    nodeUrl: URL,
    node: unknown,
) {
    const ref = selectNodeRef(node);
    if (ref == null) {
        return nodeUrl;
    }
    const refNodeUrl = new URL(ref, nodeUrl);
    return refNodeUrl;
}
