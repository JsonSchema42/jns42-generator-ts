import { crc32 } from "crc";

export class Namer {
    constructor(private readonly seed: number) {

    }

    private nameIdMap = new Map<string, string[]>();
    private idNameMap = new Map<string, string>();

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
            this.idNameMap.set(id, name);
            return;
        }

        if (ids.length === 1) {
            for (const id of ids) {
                const uniqueName = this.createUniqueName(name, id);

                this.idNameMap.set(id, uniqueName);
            }
        }

        const uniqueName = this.createUniqueName(name, id);

        ids.push(id);
        this.idNameMap.set(id, uniqueName);
    }

    public getName(id: string) {
        return this.idNameMap.get(id);
    }

    protected createUniqueName(name: string, id: string) {
        const suffix = crc32(id, this.seed).toString(36);

        return `${name} ${suffix}`;
    }

}
