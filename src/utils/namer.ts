import { crc32 } from "crc";

export class Namer {
    constructor(private readonly seed: number) {

    }

    private nameIdMap = new Map<string, string[]>();
    private idNameMap = new Map<string, string[]>();

    public registerName(
        id: string,
        name: string,
    ) {
        if (this.idNameMap.has(id)) {
            throw new Error("id already used");
        }

        let ids = this.nameIdMap.get(name);
        if (ids == null) {
            ids = [id];
            this.nameIdMap.set(name, ids);
            this.idNameMap.set(id, [name]);
            return;
        }

        if (ids.length === 1) {
            for (const id of ids) {
                const suffix = this.createSuffix(id);

                this.idNameMap.set(id, [name, suffix]);
            }
        }

        const suffix = this.createSuffix(id);

        ids.push(id);
        this.idNameMap.set(id, [name, suffix]);
    }

    public getName(id: string) {
        const name = this.idNameMap.get(id);

        if (name == null) {
            throw new Error("name not registered");
        }

        return name;
    }

    protected createSuffix(id: string) {
        return crc32(id, this.seed).toString(36);
    }

}
