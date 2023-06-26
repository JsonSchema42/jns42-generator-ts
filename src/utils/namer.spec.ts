import assert from "node:assert";
import test from "node:test";
import { Namer } from "./namer.js";

test("namer", () => {
    const namer = new Namer(0, "");

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
        "http://www.com/#/A": "A",
        "http://www.com/#/B": "B",
        "http://www.com/#/B/C": "BC",
        "http://www.com/#/A/C": "AC",
        "http://www.com/#/C/A": "CA",
    });
});
