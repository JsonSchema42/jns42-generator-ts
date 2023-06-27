import ts from "typescript";
import { Node } from "../schema/intermediate.js";

export abstract class CodeGeneratorBase {
    constructor(
        protected readonly factory: ts.NodeFactory,
        protected readonly namespaces: Record<string, string>,
        protected readonly names: Record<string, Record<string, string>>,
        protected readonly nodes: Record<string, Node>
    ) {}

    protected getTypeNamespace(nodeId: string) {
        const nodeUrl = new URL(nodeId);
        const serverId = nodeUrl.protocol + "//" + nodeUrl.host + nodeUrl.pathname + nodeUrl.search;
        const name = this.namespaces[serverId];
        return name;
    }

    protected getTypeName(nodeId: string) {
        const nodeUrl = new URL(nodeId);
        const serverId = nodeUrl.protocol + "//" + nodeUrl.host + nodeUrl.pathname + nodeUrl.search;
        const hash = nodeUrl.hash;
        const name = this.names[serverId][hash];
        return name;
    }

    protected generateTypeReference(nodeId: string) {
        const { factory: f } = this;

        const namespace = this.getTypeNamespace(nodeId);
        const name = this.getTypeName(nodeId);
        return f.createTypeReferenceNode(
            f.createQualifiedName(f.createIdentifier(namespace), f.createIdentifier(name))
        );
    }
}
