import assert from "node:assert";
import test from "node:test";
import { flattenObject } from "./object.js";

test("flatten-object", () => {
    {
        const actual = [...flattenObject({})];
        const expected: unknown[] = [];
        assert.deepStrictEqual(actual, expected);
    }

    {
        const actual = [...flattenObject({
            a: [1, 2],
            b: [3, 4, 5],
            c: [6, 7, 8, 9],
        })];

        const expected = [
            { a: 1, b: 3, c: 6 },
            { a: 2, b: 3, c: 6 },
            { a: 1, b: 4, c: 6 },
            { a: 2, b: 4, c: 6 },
            { a: 1, b: 5, c: 6 },
            { a: 2, b: 5, c: 6 },
            { a: 1, b: 3, c: 7 },
            { a: 2, b: 3, c: 7 },
            { a: 1, b: 4, c: 7 },
            { a: 2, b: 4, c: 7 },
            { a: 1, b: 5, c: 7 },
            { a: 2, b: 5, c: 7 },
            { a: 1, b: 3, c: 8 },
            { a: 2, b: 3, c: 8 },
            { a: 1, b: 4, c: 8 },
            { a: 2, b: 4, c: 8 },
            { a: 1, b: 5, c: 8 },
            { a: 2, b: 5, c: 8 },
            { a: 1, b: 3, c: 9 },
            { a: 2, b: 3, c: 9 },
            { a: 1, b: 4, c: 9 },
            { a: 2, b: 4, c: 9 },
            { a: 1, b: 5, c: 9 },
            { a: 2, b: 5, c: 9 },
        ];

        assert.deepStrictEqual(actual, expected);
    }

});
