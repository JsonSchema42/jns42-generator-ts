import camelcase from "camelcase";
import assert from "node:assert";

const startsWithNumberRe = /^[0-9]/gu;
const startsWithLetterRe = /^[a-zA-Z]/gu;
const nonIdentifierRe = /[^a-zA-Z0-9]/gu;

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
    constructor(rootNamePart: string) {
        rootNamePart = rootNamePart.replace(nonIdentifierRe, "");
        rootNamePart = camelcase(rootNamePart, { pascalCase: true });
        this.rootNameNode = {
            part: rootNamePart,
            children: {},
            ids: [],
        };
    }

    private rootNameNode: NameNode;
    private leafNodes: Record<string, NameNode> = {};

    public registerId(id: string) {
        const url = new URL(id);
        const hash = url.hash.startsWith("#") ? url.hash.substring(1) : url.hash;
        const nameParts = hash
            .split("/")
            .map(decodeURI)
            .map((part) => part.replace(nonIdentifierRe, ""))
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
        node.ids.sort();
        assert(this.leafNodes[id] == null);
        this.leafNodes[id] = node;
    }

    public getNames() {
        return Object.fromEntries(this.getNameEntries());
    }

    private *getNameEntries(): Iterable<[string, string]> {
        const nameMap = new Map<string, Array<[NameNode | undefined, NameNode]>>();

        /*
        Should we continue?
        */
        let shouldContinueCounter = 0;

        /*
        Initially fill nameMap
        */
        for (const [id, node] of Object.entries(this.leafNodes)) {
            let nodes = nameMap.get(node.part);
            if (nodes == null) {
                nodes = [];
                nameMap.set(node.part, nodes);
            } else {
                shouldContinueCounter += 1;
            }
            nodes.push([node, node]);
        }

        /*
        De-duping process
        */
        while (shouldContinueCounter > 0) {
            shouldContinueCounter = 0;

            for (const [name, nodes] of nameMap) {
                if (nodes.length === 1) {
                    continue;
                }

                /*
                Collect unique parents nameParts. If there are no unique parents, we want
                to not include the parents namePart in the name.
                */
                const uniqueParentNameParts = new Set<string>();
                for (const [currentNode, targetNode] of nodes) {
                    if (!currentNode) {
                        continue;
                    }

                    if (currentNode.parent) {
                        uniqueParentNameParts.add(currentNode.parent.part);
                    }
                }

                if (nodes.every(([currentNode]) => currentNode != null)) {
                    /*
                    Delete the entry, we are going to put it back later
                    */
                    nameMap.delete(name);
                }

                for (const [currentNode, targetNode] of nodes) {
                    if (currentNode == null) {
                        continue;
                    }

                    let parentNode = currentNode.parent;
                    let newName = name;
                    if (parentNode != null) {
                        if (uniqueParentNameParts.size > 1) {
                            newName = parentNode.part + newName;
                        }
                    }
                    let newNodes = nameMap.get(newName);
                    if (newNodes == null) {
                        newNodes = [];
                        nameMap.set(newName, newNodes);
                    } else {
                        shouldContinueCounter += 1;
                    }
                    newNodes.push([parentNode, targetNode]);
                }
            }
        }

        /*
        Output nameMap into an iterable of entries
        */
        for (const [name, nodes] of nameMap) {
            assert(nodes.length === 1);
            const [[, node]] = nodes;

            if (node.ids.length === 1) {
                const [id] = node.ids;
                yield [id, name];
            }

            if (node.ids.length > 1) {
                for (const [index, id] of Object.entries(node.ids)) {
                    yield [id, name + index];
                }
            }
        }
    }
}
