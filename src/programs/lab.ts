import * as yargs from "yargs";

export function configureLabProgram(argv: yargs.Argv) {
    return argv.
        command(
            "lab [schema-url]",
            "load schema from url",
            yargs => yargs
                .positional("schemaUrl", {
                    describe: "url to download schema from",
                    type: "string",
                    default: "https://json-schema.org/draft/2020-12/schema",
                })
            ,
            argv => {
                console.log("lab");
            },
        );
}
