export function createNames(
    schemaNodeIndex: Map<string, unknown>,
    baseUrl: URL,
) {
    const urls = findTypeUrls(schemaNodeIndex, baseUrl);
    return [...urls];
}

// eslint-disable-next-line complexity
function* findTypeUrls(
    schemaNodeIndex: Map<string, unknown>,
    nodeUrl: URL,
): Iterable<URL> {
    yield nodeUrl;

    const node = schemaNodeIndex.get(String(nodeUrl));
    if (node == null) {
        throw new Error("node not found");
    }

    if (typeof node === "object") {
        let types: Array<string>;

        if (
            "type" in node &&
            typeof node.type === "string"
        ) {
            types = [node.type];
        }
        else if (
            "type" in node &&
            Array.isArray(node.type)
        ) {
            types = node.type;
        }
        else {
            throw new Error("invalid type or type not set");
        }

        for (const type of types) {
            switch (type) {
                case "null":
                    break;

                case "object":
                    if (
                        "properties" in node &&
                        typeof node.properties === "object" &&
                        node.properties != null
                    ) {
                        for (const [key, subNode] of Object.entries(node.properties)) {
                            const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/properties/${encodeURIComponent(key)}`, nodeUrl);
                            yield* findTypeUrls(schemaNodeIndex, subNodeUrl);
                        }
                    }
                    else if (
                        "additionalProperties" in node &&
                        typeof node.additionalProperties === "object" &&
                        node.additionalProperties != null
                    ) {
                        const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/additionalProperties`, nodeUrl);
                        yield* findTypeUrls(schemaNodeIndex, subNodeUrl);
                    }
                    else if (
                        "additionalProperties" in node &&
                        node.additionalProperties === true
                    ) {
                        const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/additionalProperties`, nodeUrl);
                        yield* findTypeUrls(schemaNodeIndex, subNodeUrl);
                    }
                    else if (
                        "additionalProperties" in node &&
                        node.additionalProperties === false
                    ) {
                        const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/additionalProperties`, nodeUrl);
                        yield* findTypeUrls(schemaNodeIndex, subNodeUrl);
                    }
                    else {
                        throw new Error("invalid object type");
                    }
                    break;

                case "array":
                    if (
                        "items" in node &&
                        Array.isArray(node.items)
                    ) {
                        for (const [key, subNode] of Object.entries(node.items)) {
                            const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/items/${encodeURIComponent(key)}`, nodeUrl);
                            yield* findTypeUrls(schemaNodeIndex, subNodeUrl);
                        }
                    }
                    else if (
                        "items" in node &&
                        typeof node.items == "object"
                    ) {
                        const subNodeUrl = new URL(`${nodeUrl.hash === "" ? "#" : nodeUrl.hash}/items`, nodeUrl);
                        yield* findTypeUrls(schemaNodeIndex, subNodeUrl);
                    }
                    else {
                        throw new Error("invalid array type");
                    }
                    break;

                case "boolean":
                    break;

                case "number":
                    break;

                case "integer":
                    break;

                case "string":
                    break;

                default:
                    throw new Error("unknown type");
            }
        }
    }
}
