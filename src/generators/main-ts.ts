import { CodeGeneratorBase } from "./code-generator-base.js";

export class MainTsCodeGenerator extends CodeGeneratorBase {

    public * getStatements() {
        const { factory } = this;

        yield factory.createExportDeclaration(
            undefined,
            false,
            undefined,
            factory.createStringLiteral("./types.js"),
            undefined,
        );

        yield factory.createExportDeclaration(
            undefined,
            false,
            undefined,
            factory.createStringLiteral("./validators.js"),
            undefined,
        );
    }

}
