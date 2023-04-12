import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { SchemaManager } from "../schema/manager.js";
import { Namer, formatData, formatStatements, projectRoot } from "../utils/index.js";
import { getMainTsStatements } from "./main-ts.js";
import { getPackageJsonData } from "./package-json.js";
import { getTsconfigJsonData } from "./tsconfig-json.js";

export interface PackageOptions {
    name: string
    version: string
    directoryPath: string
    generateTest: boolean
    rootNodeUrl: URL
}

export function generatePackage(
    factory: ts.NodeFactory,
    manager: SchemaManager,
    namer: Namer,
    options: PackageOptions,
) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(options.directoryPath, { recursive: true });

    {
        const data = getPackageJsonData(options.name, options.version);
        const filePath = path.join(options.directoryPath, "package.json");
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFileSync(filePath, formatData(data));
    }

    {
        const data = getTsconfigJsonData();
        const filePath = path.join(options.directoryPath, "tsconfig.json");
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFileSync(filePath, formatData(data));
    }

    {
        const statements = getMainTsStatements(factory);
        const filePath = path.join(options.directoryPath, "main.ts");
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFileSync(filePath, formatStatements(factory, statements));
    }

    {
        const content = getTypesFileContent(factory, manager);
        const filePath = path.join(options.directoryPath, "types.ts");
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFileSync(filePath, content);
    }

    {
        const content = getValidatorsFileContent(factory, manager);
        const filePath = path.join(options.directoryPath, "validators.ts");
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFileSync(filePath, content);
    }

    {
        const content = path.join(projectRoot, "src", "includes", "validation.ts");
        const filePath = path.join(options.directoryPath, "validation.ts");
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.copyFileSync(content, filePath);
    }
    if (options.generateTest) {
        const content = getSpecFileContent(factory, manager, options.rootNodeUrl);
        const filePath = path.join(options.directoryPath, "schema.spec.ts");
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFileSync(filePath, content);

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.mkdirSync(path.join(options.directoryPath, "examples", "valid"), { recursive: true });
        {
            let index = 0;
            for (const example of manager.generateValidExamples(options.rootNodeUrl)) {
                index++;
                const content = JSON.stringify(example, undefined, 2);
                const filePath = path.join(
                    options.directoryPath,
                    "examples",
                    "valid",
                    `valid-${options.name}-${index}.json`,
                );
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                fs.writeFileSync(filePath, content);
            }
        }

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.mkdirSync(path.join(options.directoryPath, "examples", "invalid"), { recursive: true });
        {
            let index = 0;
            for (const example of manager.generateInvalidExamples(options.rootNodeUrl)) {
                index++;
                const content = JSON.stringify(example, undefined, 2);
                const filePath = path.join(
                    options.directoryPath,
                    "examples",
                    "invalid",
                    `invalid-${options.name}-${index}.json`,
                );
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                fs.writeFileSync(filePath, content);
            }
        }
    }

}
