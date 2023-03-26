import { crc32 } from "crc";

/**
 * Namer unique name generator class
 */
export class Namer {
    /**
     * Namer unique name generator class
     * @param seed if a name collision happend namer will suffix the name with a crc of the id. If
     * this would ever result in a collision then change the seed!
     */
    constructor(private readonly seed: number) {

    }

    private nameIdMap = new Map<string, string[]>();
    private idNameMap = new Map<string, string[]>();

    /**
     * Register this name with an id of the thing you are naming. After registering all your
     * names, use the `getName` to get a unique name based on or the same as the one you provide
     * here.
     * 
     * @param id identity of the thing you are naming
     * @param name name of the thing
     * @returns void
     */
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

    /**
     * This method will return a unique name for one of the names registered via the
     * `registerName` method. The name might be the same, but there is a change that the
     * name is made unique. This is done by suffixing a crc hash of the id to it. This
     * makes for stable and predictable uniqueness.
     * 
     * @param id id of the thing you want a name for
     * @returns unique name as an array of strings, join it to get something printable.
     */
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
