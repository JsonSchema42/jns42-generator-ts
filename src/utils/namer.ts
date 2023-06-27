import camelcase from "camelcase";
import assert from "node:assert";

const startsWithLetterRe = /^[a-zA-Z]/u;
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

    public registerPath(id: string, path: string) {
        const nameParts = path
            .split("/")
            .map(decodeURI)
            .map((part) => part.replace(nonIdentifierRe, " "))
            .map((part) => camelcase(part, { pascalCase: true }))
            .filter((part) => part.length > 0);
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
        let nameMap = new Map<string, Array<[NameNode | undefined, NameNode]>>();

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
                if (!startsWithLetterRe.test(node.part)) {
                    shouldContinueCounter += 1;
                }
            } else {
                shouldContinueCounter += 1;
            }
            nodes.push([node, node]);
        }

        /*
        De-duping process
        */
        while (shouldContinueCounter > 0) {
            const newNameMap = new Map<string, Array<[NameNode | undefined, NameNode]>>();

            shouldContinueCounter = 0;

            for (const [name, nodes] of nameMap) {
                /*
                if nodes.length is one then there are no duplicates. If then name starts
                with a letter, we can move on to the next name.
                */
                if (nodes.length === 1 && startsWithLetterRe.test(name)) {
                    const [[currentNode, targetNode]] = nodes;
                    newNameMap.set(name, [[currentNode, targetNode]]);
                    continue;
                }

                /*
                Collect unique parents nameParts. If there are no unique parents, we want
                to not include the parents namePart in the name.
                */
                const uniqueParentNameParts = new Set<string | undefined>();
                for (const [currentNode] of nodes) {
                    if (!currentNode) {
                        continue;
                    }

                    uniqueParentNameParts.add(currentNode?.parent?.part);
                }

                for (const [currentNode, targetNode] of nodes) {
                    if (currentNode == null) {
                        newNameMap.set(name, [[undefined, targetNode]]);
                        if (!startsWithLetterRe.test(name)) {
                            shouldContinueCounter += 1;
                        }
                        continue;
                    }

                    let newCurrentNode = currentNode.parent;
                    let newName = name;
                    if (newCurrentNode != null) {
                        if (uniqueParentNameParts.size > 1 || !startsWithLetterRe.test(newName)) {
                            newName = newCurrentNode.part + newName;
                        }
                    }

                    let newNodes = newNameMap.get(newName);
                    if (newNodes == null) {
                        newNodes = [];
                        newNameMap.set(newName, newNodes);
                        if (!startsWithLetterRe.test(newName)) {
                            shouldContinueCounter += 1;
                        }
                    } else {
                        shouldContinueCounter += 1;
                    }
                    newNodes.push([newCurrentNode, targetNode]);
                }
            }

            nameMap = newNameMap;
        }

        /*
        Output nameMap into an iterable of entries
        */
        for (const [name, nodes] of nameMap) {
            assert(nodes.length === 1);
            const [[currentNode, targetNode]] = nodes;

            if (targetNode.ids.length === 1) {
                const [id] = targetNode.ids;
                yield [id, name];
            }

            if (targetNode.ids.length > 1) {
                for (const [index, id] of Object.entries(targetNode.ids)) {
                    yield [id, name + "$" + index];
                }
            }
        }
    }
}
