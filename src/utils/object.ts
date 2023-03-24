export function* flattenObject(
    obj: Record<string, unknown[]>,
) {
    for (const indexer of generateObjectIndexers(obj)) {
        yield Object.fromEntries(indexer.map(
            // eslint-disable-next-line security/detect-object-injection
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
        // eslint-disable-next-line security/detect-object-injection
        yield objectEntries.map(([property], index) => [property, counters[index]]);

        for (let index = 0; index < objectEntries.length; index++) {
            // eslint-disable-next-line security/detect-object-injection
            const [, values] = objectEntries[index];
            // eslint-disable-next-line security/detect-object-injection
            counters[index]++;

            // eslint-disable-next-line security/detect-object-injection
            if (counters[index] < values.length) {
                break;
            }

            if (index >= objectEntries.length - 1) {
                return;
            }

            // eslint-disable-next-line security/detect-object-injection
            counters[index] = 0;
        }

    }
}

