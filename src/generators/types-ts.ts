import { CodeGeneratorBase } from "./code-generator-base.js";

export class TypesTsCodeGenerator extends CodeGeneratorBase {

    public * getStatements() {
        yield* this.manager.generateTypeStatements(this.factory, this.namer);
    }

}
