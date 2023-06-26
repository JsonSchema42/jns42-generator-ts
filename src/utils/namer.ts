import camelcase from "camelcase";
import { crc32 } from "crc";
import assert from "node:assert";

interface NameNode {
    part: string;
    children: Record<string, NameNode>;
    parent?: NameNode;
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
    constructor(private readonly seed: number, private readonly defaultTypeName: string) {}

    private rootNameNode: NameNode = {
        part: "",
        children: {},
        ids: [],
    };
    private leafNodes: Record<string, NameNode> = {};

    public registerId(id: string) {
        const url = new URL(id);
        const hash = url.hash.startsWith("#") ? url.hash.substring(1) : url.hash;
        const nameParts = [this.defaultTypeName, ...hash.split("/").map(decodeURI)]
            .map((part) => part.replace(/[^a-zA-Z0-9]/gu, ""))
            .filter((part) => part.length > 0)
            .map((part) => camelcase(part, { pascalCase: true }));
        this.registerNameParts(id, nameParts);
    }

    private registerNameParts(id: string, nameParts: string[]) {
        let node = this.rootNameNode;
        for (const namePart of nameParts) {
            let childNode = node.children[namePart];
            if (childNode == null) {
                childNode = {
                    part: namePart,
                    children: {},
                    ids: [],
                };
                node.children[namePart] = childNode;
                childNode.parent = node;
            }
            node = childNode;
        }
        node.ids.push(id);
        assert(this.leafNodes[id] == null);
        this.leafNodes[id] = node;
    }

    public getNames() {
        return Object.fromEntries(this.getNameEntries());
    }

    private *getNameEntries(): Iterable<[string, string]> {
        const nameMap = new Map<string, NameNode[]>();

        let duplicates = 0;
        for (const [id, node] of Object.entries(this.leafNodes)) {
            let nodes = nameMap.get(node.part);
            if (nodes == null) {
                nodes = [];
                nameMap.set(node.part, nodes);
            } else {
                duplicates += 1;
            }
            nodes.push(node);
        }

        while (duplicates > 0) {
            duplicates = 0;
            for (const [name, nodes] of nameMap) {
                if (nodes.length === 1) continue;

                nameMap.delete(name);
                for (const node of nodes) {
                    let newName = (node.parent?.part ?? "") + name;
                    let newNodes = nameMap.get(newName);
                    if (newNodes == null) {
                        newNodes = [];
                        nameMap.set(newName, newNodes);
                    } else {
                        duplicates += 1;
                    }
                    newNodes.push(node);
                }
            }
        }

        for (const [name, nodes] of nameMap) {
            assert(nodes.length === 1);
            const [node] = nodes;

            if (node.ids.length === 1) {
                const [id] = node.ids;
                yield [id, name];
            }

            if (node.ids.length > 1) {
                for (const id of node.ids) {
                    yield [id, name + this.createSuffix(id)];
                }
            }
        }
    }

    protected createSuffix(id: string) {
        return String(crc32(id, this.seed) % 1000000).padStart(6, "0");
    }
}
