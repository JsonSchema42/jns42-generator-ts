import { PackageJson } from "type-fest";
import { packageInfo } from "../utils/index.js";

export function getPackageJsonData(
    name: string,
    version: string,
) {
    const content: PackageJson = {
        "name": name,
        "version": version,
        "sideEffects": false,
        "type": "module",
        "main": "main.js",
        "types": "main.d.ts",
        "files": [
            "*",
        ],
        "scripts": {
            "prepare": "tsc",
        },
        "author": "",
        "license": "ISC",
        "dependencies": withDependencies([
        ]),
        "devDependencies": withDependencies([
            "typescript",
            "@types/node",
        ]),
    };

    return content;
}

function withDependencies(
    names: string[],
) {
    return names.reduce(
        (o, name) => Object.assign(o, {
            [name]:

                packageInfo.dependencies?.[name] ??

                packageInfo.devDependencies?.[name],
        }),
        {},
    );
}