export function iterableElementsEqual<T>(
    iterable: Iterable<T>,
    otherIterable: Iterable<T>,
) {
    const set = new Set(iterable);
    for (const element of otherIterable) {
        const exsisted = set.delete(element);
        if (!exsisted) {
            return false;
        }
    }

    if (set.size > 0) {
        return false;
    }

    return true;
}
