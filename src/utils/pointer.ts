export function appendJsonPointer(basePointer: string, ...subPointerParts: string[]) {
    return basePointer + subPointerParts.
        map(part => "/" + encodeURI(part)).
        join("");
}
