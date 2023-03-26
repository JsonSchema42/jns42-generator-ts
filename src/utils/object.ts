export function* flattenObject<T>(
    obj: Record<string, T[]>,
) {
    for (const indexer of generateObjectIndexers(obj)) {
        yield Object.fromEntries(indexer.map(

            ([property, index]) => [property, obj[property][index]] as const,
        ));
    }
}

function* generateObjectIndexers(
    obj: Record<string, unknown[]>,
): Iterable<Array<readonly [string, number]>> {
    const objectEntries = Object.entries(obj);
    const counters = objectEntries.
        map(() => 0);

    if (objectEntries.length > 0) for (; ;) {

        yield objectEntries.map(([property], index) => [property, counters[index]]);

        for (let index = 0; index < objectEntries.length; index++) {

            const [, values] = objectEntries[index];

            counters[index]++;

            if (counters[index] < values.length) {
                break;
            }

            if (index >= objectEntries.length - 1) {
                return;
            }

            counters[index] = 0;
        }

    }
}

