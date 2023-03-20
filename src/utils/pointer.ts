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

// export function hashToPointer(hash: string) {
//     if (hash.startsWith("#")) {
//         return hash.substring(1);
//     }

//     return "";
// }
