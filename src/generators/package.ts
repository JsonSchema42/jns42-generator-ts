import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { SchemaManager } from "../schema/manager.js";
import { Namer, formatData, formatStatements, projectRoot } from "../utils/index.js";
import { MainTsCodeGenerator } from "./main-ts.js";
import { getPackageJsonData } from "./package-json.js";
import { getTsconfigJsonData } from "./tsconfig-json.js";
import { TypesTsCodeGenerator } from "./types-ts.js";
import { ValidatorsTsCodeGenerator } from "./validators-ts.js";

export interface PackageOptions {
    name: string
    version: string
    directoryPath: string
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
        const codeGenerator = new MainTsCodeGenerator(
            factory,
            namer,
            manager,
        );
        const statements = codeGenerator.getStatements();
        const filePath = path.join(options.directoryPath, "main.ts");
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFileSync(filePath, formatStatements(factory, statements));
    }

    {
        const codeGenerator = new TypesTsCodeGenerator(
            factory,
            namer,
            manager,
        );
        const statements = codeGenerator.getStatements();
        const filePath = path.join(options.directoryPath, "types.ts");
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFileSync(filePath, formatStatements(factory, statements));
    }

    {
        const codeGenerator = new ValidatorsTsCodeGenerator(
            factory,
            namer,
            manager,
        );
        const statements = codeGenerator.getStatements();
        const filePath = path.join(options.directoryPath, "validators.ts");
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFileSync(filePath, formatStatements(factory, statements));
    }

    {
        const content = path.join(projectRoot, "src", "includes", "validation.ts");
        const filePath = path.join(options.directoryPath, "validation.ts");
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.copyFileSync(content, filePath);
    }

}
