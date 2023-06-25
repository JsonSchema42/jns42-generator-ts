import { crc32 } from "crc";

interface NameNode {
    children: Record<string, NameNode>;
    ids: Array<string>;
}

/**
 * Namer unique name generator class
 */
export class Namer {
    /**
     * Namer unique name generator class
     * @param seed if a name collision happened namer will suffix the name with a crc of the id. If
     * this would ever result in a collision then change the seed!
     */
    constructor(private readonly seed: number) {}

    private rootNameNode: NameNode = {
        children: {},
        ids: [],
    };

    /**
     * Register this name with an id of the thing you are naming. After registering all your
     * names, use the `getName` to get a unique name based on or the same as the one you provide
     * here.
     *
     * @param id identity of the thing you are naming
     * @param name name of the thing
     * @returns void
     */
    public registerName(id: string, nameParts: string[]) {
        let node = this.rootNameNode;
        for (const namePart of nameParts) {
            let childNode = node.children[namePart];
            if (childNode == null) {
                childNode = {
                    children: {},
                    ids: [],
                };
                node.children[namePart] = childNode;
            }
            node = childNode;
        }
        node.ids.push(id);
    }

    public getNames() {
        return Object.fromEntries(this.getNameEntries(this.rootNameNode, ""));
    }

    private *getNameEntries(node: NameNode, name: string): Iterable<[string, string[]]> {
        for (const [namePart, childNode] of Object.entries(node.children)) {
            const childName = name + namePart;

            if (childNode.ids.length === 1) {
                const [id] = childNode.ids;
                yield [id, [childName]];
            }

            if (childNode.ids.length > 1) {
                for (const id of childNode.ids) {
                    const suffix = this.createSuffix(id);
                    yield [id, [childName, suffix]];
                }
            }

            yield* this.getNameEntries(childNode, childName);
        }
    }

    protected createSuffix(id: string) {
        return String(crc32(id, this.seed) % 1000000).padStart(6, "0");
    }
}
