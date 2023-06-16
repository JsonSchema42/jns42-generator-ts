import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { Node } from "../schema/intermediate.js";
import { formatData, formatStatements } from "../utils/index.js";
import { ExamplesSpecsTsCodeGenerator } from "./examples-specs-ts.js";
import { MainTsCodeGenerator } from "./main-ts.js";
import { getPackageJsonData } from "./package-json.js";
import { getTsconfigJsonData } from "./tsconfig-json.js";
import { TypesTsCodeGenerator } from "./types-ts.js";
import { ValidatorsTsCodeGenerator } from "./validators-ts.js";

export interface PackageOptions {
    name: string;
    version: string;
    directoryPath: string;
}

export function generatePackage(
    factory: ts.NodeFactory,
    nodes: Record<string, Node>,
    names: Record<string, string[]>,
    options: PackageOptions
) {
    fs.mkdirSync(options.directoryPath, { recursive: true });

    {
        const data = getPackageJsonData(options.name, options.version);
        const filePath = path.join(options.directoryPath, "package.json");
        fs.writeFileSync(filePath, formatData(data));
    }

    {
        const data = getTsconfigJsonData();
        const filePath = path.join(options.directoryPath, "tsconfig.json");
        fs.writeFileSync(filePath, formatData(data));
    }

    {
        const codeGenerator = new MainTsCodeGenerator(factory, names, nodes);
        const statements = codeGenerator.getStatements();
        const filePath = path.join(options.directoryPath, "main.ts");
        fs.writeFileSync(filePath, formatStatements(factory, statements));
    }

    {
        const codeGenerator = new TypesTsCodeGenerator(factory, names, nodes);
        const statements = codeGenerator.getStatements();
        const filePath = path.join(options.directoryPath, "types.ts");
        fs.writeFileSync(filePath, formatStatements(factory, statements));
    }

    {
        const codeGenerator = new ValidatorsTsCodeGenerator(
            factory,
            names,
            nodes
        );
        const statements = codeGenerator.getStatements();
        const filePath = path.join(options.directoryPath, "validators.ts");
        fs.writeFileSync(filePath, formatStatements(factory, statements));
    }

    {
        const codeGenerator = new ExamplesSpecsTsCodeGenerator(
            factory,
            names,
            nodes
        );
        const statements = codeGenerator.getStatements();
        const filePath = path.join(options.directoryPath, "examples.spec.ts");
        fs.writeFileSync(filePath, formatStatements(factory, statements));
    }
}
