import { selectNodeInstanceEntries, selectNodeRefUrl } from "./selectors/index.js";

export interface SchemaCollectionInstanceItem {
    instanceNode: unknown;
    instanceUrl: URL;
    referencingInstanceUrl: URL | null;
}

export class SchemaCollection {
    instanceItemMap = new Map<string, SchemaCollectionInstanceItem>();

    private constructor() {
        //
    }

    public get itemCount() {
        return this.instanceItemMap.size;
    }

    public getInstanceItems(): Iterable<SchemaCollectionInstanceItem> {
        return this.instanceItemMap.values();
    }

    public getInstanceItem(instanceUrl: URL): SchemaCollectionInstanceItem | undefined {
        const instanceKey = String(instanceUrl);

        return this.instanceItemMap.get(instanceKey);
    }

    public *getReferenceChainUrls(instanceUrl: URL): Iterable<URL> {
        let maybeInstanceUrl: URL | null = instanceUrl;
        while (maybeInstanceUrl != null) {
            yield maybeInstanceUrl;

            const instanceMapItem = this.getInstanceItem(instanceUrl);
            if (instanceMapItem == null) {
                throw new Error("instance item not found");
            }

            maybeInstanceUrl = instanceMapItem.referencingInstanceUrl;
        }
    }

    public static async loadFromUrl(
        instanceUrl: URL,
    ) {
        const instance = new SchemaCollection();
        await instance.loadInstance(instanceUrl, null);
        return instance;
    }

    private async loadInstance(
        instanceUrl: URL,
        referencingInstanceUrl: URL | null,
    ) {
        const instanceKey = String(instanceUrl);
        const instanceMapItem = this.instanceItemMap.get(instanceKey);
        if (instanceMapItem != null) {
            return;
        }

        const instanceNode = await fetchInstance(instanceUrl);
        this.instanceItemMap.set(
            instanceKey,
            {
                instanceNode: instanceNode,
                instanceUrl: instanceUrl,
                referencingInstanceUrl: referencingInstanceUrl,
            },
        );

        await this.loadInstanceReferences(
            instanceUrl,
            instanceNode,
        );
    }

    private async loadInstanceReferences(
        nodeUrl: URL,
        node: unknown,
    ) {
        const refNodeUrl = selectNodeRefUrl(nodeUrl, node);

        if (refNodeUrl != null) {
            const referenceInstanceUrl = toInstanceUrl(refNodeUrl);
            const referencingInstanceUrl = toInstanceUrl(nodeUrl);
            await this.loadInstance(
                referenceInstanceUrl,
                referencingInstanceUrl,
            );
        }

        for (const [childNodeUrl, childNode] of selectNodeInstanceEntries(nodeUrl, node)) {
            await this.loadInstanceReferences(
                childNodeUrl,
                childNode,
            );
        }
    }
}

async function fetchInstance(instanceUrl: URL) {
    const result = await fetch(instanceUrl);
    const instanceNode = await result.json();

    return instanceNode;
}

function toInstanceUrl(nodeUrl: URL) {
    const instanceUrl = new URL(nodeUrl);
    instanceUrl.hash = "";
    return instanceUrl;
}
