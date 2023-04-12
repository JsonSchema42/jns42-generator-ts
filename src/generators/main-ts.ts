import ts from "typescript";

export function* getMainTsStatements(
    factory: ts.NodeFactory,
) {

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
