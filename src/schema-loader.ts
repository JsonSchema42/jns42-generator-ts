export class SchemaLoader {
    schemas = new Map<string, unknown>();

    async fetchSchema(schemaUrl: URL) {
        const result = await fetch(schemaUrl);
        const schema = await result.json();

        return schema;
    }

    async loadSchema(schemaUrl: URL) {
        let schema = this.schemas.get(String(schemaUrl));
        if (schema != null) {
            return schema;
        }

        schema = await this.fetchSchema(schemaUrl);
        this.schemas.set(schemaUrl.href, schema);

        await this.loadSchemaReferences(schemaUrl, schema);
    }

    async loadSchemaReferences(baseUrl: URL, node: unknown) {
        if (
            node != null &&
            typeof node === "object"
        ) {
            if (
                "$ref" in node &&
                typeof node.$ref === "string"
            ) {
                const referenceSchemaUrl = toServerUrl(new URL(node.$ref, baseUrl));
                await this.loadSchema(referenceSchemaUrl);
            }

            const entries = Object.entries(node);
            for (const [key, childNode] of entries) {
                await this.loadSchemaReferences(baseUrl, childNode);
            }
        }

    }

}

function toServerUrl(clientUrl: URL) {
    const serverUrl = new URL(clientUrl);
    serverUrl.hash = "";
    return serverUrl;
}
