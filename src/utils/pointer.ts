export function appendJsonPointer(basePointer: string, ...subPointerParts: string[]) {
    return basePointer + subPointerParts.
        map(part => "/" + encodeURI(part)).
        join("");
}

export function pointerToHash(pointer: string) {
    if (pointer === "") {
        return "";
    }

    return "#" + pointer;
}
