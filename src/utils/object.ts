export type Unflattened<T> = {
    [P in keyof T]: Array<T[P]>
}

/**
 * yields every possible combination of the provided object. The object has properties that are
 * arrays. For every value in every project a new object, with the properties not as an array,
 * is yielded.
 * 
 * @param obj object with properties as an array
 */
export function* flattenObject<T extends object>(
    obj: Unflattened<T>,
): Iterable<T> {
    const objectEntries = Object.entries<unknown[]>(obj);
    const counters = objectEntries.
        map(() => 0);

    if (objectEntries.length > 0) for (; ;) {

        yield Object.fromEntries(
            objectEntries.map(
                ([property, values], index) => [property, values[counters[index]]] as const,
            ),
        ) as T;

        for (let index = 0; ; index++) {
            if (index >= objectEntries.length) {
                return;
            }

            const [, values] = objectEntries[index];

            counters[index]++;

            if (counters[index] < values.length) {
                break;
            }

            counters[index] = 0;
        }

    }

}

