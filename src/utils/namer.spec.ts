import assert from "node:assert";
import test from "node:test";
import { Namer } from "./namer.js";

test("namer 1", () => {
    const namer = new Namer("o");

    namer.registerId("http://www.com/#/A");
    assert.deepStrictEqual(namer.getNames(), {
        "http://www.com/#/A": "A",
    });

    namer.registerId("http://www.com/#/B");
    assert.deepStrictEqual(namer.getNames(), {
        "http://www.com/#/A": "A",
        "http://www.com/#/B": "B",
    });

    namer.registerId("http://www.com/#/B/C");
    assert.deepStrictEqual(namer.getNames(), {
        "http://www.com/#/A": "A",
        "http://www.com/#/B": "B",
        "http://www.com/#/B/C": "C",
    });

    namer.registerId("http://www.com/#/A/C");
    assert.deepStrictEqual(namer.getNames(), {
        "http://www.com/#/A": "A",
        "http://www.com/#/B": "B",
        "http://www.com/#/B/C": "BC",
        "http://www.com/#/A/C": "AC",
    });

    namer.registerId("http://www.com/#/C/A");
    assert.deepStrictEqual(namer.getNames(), {
        "http://www.com/#/A": "OA",
        "http://www.com/#/B": "B",
        "http://www.com/#/B/C": "BC",
        "http://www.com/#/A/C": "AC",
        "http://www.com/#/C/A": "CA",
    });

    namer.registerId("http://www.com/#/A/B/C");
    assert.deepStrictEqual(namer.getNames(), {
        "http://www.com/#/A": "OA",
        "http://www.com/#/B": "B",
        "http://www.com/#/B/C": "OBC",
        "http://www.com/#/A/C": "AC",
        "http://www.com/#/C/A": "CA",
        "http://www.com/#/A/B/C": "ABC",
    });

    namer.registerId("http://www.com/#/A/B/C/D/E/F");
    assert.deepStrictEqual(namer.getNames(), {
        "http://www.com/#/A": "OA",
        "http://www.com/#/B": "B",
        "http://www.com/#/B/C": "OBC",
        "http://www.com/#/A/C": "AC",
        "http://www.com/#/C/A": "CA",
        "http://www.com/#/A/B/C": "ABC",
        "http://www.com/#/A/B/C/D/E/F": "F",
    });

    namer.registerId("http://www.com/#/X/Y/Z/D/E/F");
    assert.deepStrictEqual(namer.getNames(), {
        "http://www.com/#/A": "OA",
        "http://www.com/#/B": "B",
        "http://www.com/#/B/C": "OBC",
        "http://www.com/#/A/C": "AC",
        "http://www.com/#/C/A": "CA",
        "http://www.com/#/A/B/C": "ABC",
        "http://www.com/#/A/B/C/D/E/F": "CF",
        "http://www.com/#/X/Y/Z/D/E/F": "ZF",
    });

    namer.registerId("http://www.com/#/X/Y/Z/D/E/1");
    assert.deepStrictEqual(namer.getNames(), {
        "http://www.com/#/A": "OA",
        "http://www.com/#/B": "B",
        "http://www.com/#/B/C": "OBC",
        "http://www.com/#/A/C": "AC",
        "http://www.com/#/C/A": "CA",
        "http://www.com/#/A/B/C": "ABC",
        "http://www.com/#/A/B/C/D/E/F": "CF",
        "http://www.com/#/X/Y/Z/D/E/F": "ZF",
        "http://www.com/#/X/Y/Z/D/E/1": "E1",
    });
});

test("namer 2", () => {
    const namer = new Namer("o");

    namer.registerId("http://www.com/#/");
    assert.deepStrictEqual(namer.getNames(), {
        "http://www.com/#/": "O",
    });

    namer.registerId("http://www.com/#/A");
    assert.deepStrictEqual(namer.getNames(), {
        "http://www.com/#/": "O",
        "http://www.com/#/A": "A",
    });
});

test("namer 3", () => {
    const namer = new Namer("o");

    namer.registerId("http://www.com/#/");
    assert.deepStrictEqual(namer.getNames(), {
        "http://www.com/#/": "O",
    });

    namer.registerId("http://www.com/#/1");
    assert.deepStrictEqual(namer.getNames(), {
        "http://www.com/#/": "O",
        "http://www.com/#/1": "O1",
    });
});
