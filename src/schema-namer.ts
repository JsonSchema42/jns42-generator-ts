import camelCase from "camelcase";
import { SchemaCollection } from "./schema-collection.js";
import { selectNodeInstanceEntries } from "./selectors/index.js";

export class SchemaNamer {
    private nameMap = new Map<string, string>();

    constructor(schemaCollection: SchemaCollection) {
        this.loadFromSchemaCollectionInstanceItems(schemaCollection);
    }

    public get nameCount() {
        return this.nameMap.size;
    }

    public getName(nodeUrl: URL) {
        const nodeKey = String(nodeUrl);
        return this.nameMap.get(nodeKey);
    }

    private loadFromSchemaCollectionInstanceItems(schemaCollection: SchemaCollection) {
        for (const instanceItem of schemaCollection.getInstanceItems()) {
            const instanceName = makeTypeBaseName(instanceItem.instanceUrl);

            this.loadFromSchemaCollectionInstanceItem(
                instanceName,
                instanceItem.instanceUrl,
                instanceItem.instanceNode,
            );
        }
    }

    private loadFromSchemaCollectionInstanceItem(
        name: string,
        nodeUrl: URL,
        node: unknown,
    ) {
        const nodeKey = String(nodeUrl);
        this.nameMap.set(nodeKey, name);

        for (const [childNodeUrl, childNode] of selectNodeInstanceEntries(nodeUrl, node)) {
            const childName = makeTypeName(
                childNodeUrl,
                name,
            );
            this.loadFromSchemaCollectionInstanceItem(
                childName,
                childNodeUrl,
                childNode,
            );
        }

    }

}

function makeTypeBaseName(url: URL) {
    const parts = new Array<string>();
    const re = /^.*\/(.*?)$/u;
    const re2 = /[^a-z0-9]/gi;

    const match = re.exec(url.pathname);

    if (match != null) {
        parts.push(match[1].replace(re2, ""));
    }

    return camelCase(parts, { pascalCase: true });
}

function makeTypeName(url: URL, baseName: string) {
    const parts = new Array<string>();
    const re = /^.*\/(.*?)$/u;
    const re2 = /[^a-z0-9]/gi;

    const match = re.exec(url.hash);

    parts.push(baseName);

    if (match != null) {
        parts.push(match[1].replace(re2, ""));
    }

    return camelCase(parts, { pascalCase: true });
}
