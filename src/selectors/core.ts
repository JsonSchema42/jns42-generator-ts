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

