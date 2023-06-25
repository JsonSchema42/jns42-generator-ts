import camelcase from "camelcase";

export function getNodeTypeName(nodeUrl: URL): string {
    const reReplace = /[^A-Za-z0-9-_.,]/gu;

    const pointer = nodeUrl.hash.startsWith("#") ? nodeUrl.hash.substring(1) : "";

    const pathParts = nodeUrl.pathname
        .split("/")
        .map(decodeURI)
        .map((value) => value.replace(reReplace, ""))
        .filter((value) => value !== "");
    const pointerParts = pointer
        .split("/")
        .map(decodeURI)
        .map((value) => value.replace(reReplace, ""));

    const nameParts = [
        pathParts[pathParts.length - 1] ?? "Schema",
        pointerParts[pointerParts.length - 3],
        pointerParts[pointerParts.length - 2],
        pointerParts[pointerParts.length - 1],
    ]
        .filter((value) => value != null)
        .filter((value) => value != "");

    const name = camelcase(nameParts, { pascalCase: true });

    return name;
}
