import { CodeGeneratorBase } from "./code-generator-base.js";

export class ValidatorsTsCodeGenerator extends CodeGeneratorBase {

    public * getStatements() {
        yield* this.manager.generateValidatorStatements(this.factory, this.namer);
    }

}
