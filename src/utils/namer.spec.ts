import assert from "node:assert";
import test from "node:test";
import { Namer } from "./namer.js";

test("namer", () => {
    const namer = new Namer(0);

    namer.registerName("1", ["A"]);

    assert.deepStrictEqual(namer.getNames(), {
        "1": ["A"],
    });

    namer.registerName("2", ["B"]);
    assert.deepStrictEqual(namer.getNames(), {
        "1": ["A"],
        "2": ["B"],
    });

    namer.registerName("3", ["C", "B"]);
    assert.deepStrictEqual(namer.getNames(), {
        "1": ["A"],
        "2": ["B"],
        "3": ["C"],
    });

    namer.registerName("4", ["C", "A"]);
    assert.deepStrictEqual(namer.getNames(), {
        "1": ["A"],
        "2": ["B"],
        "3": ["BC"],
        "4": ["AC"],
    });

    namer.registerName("5", ["A", "C"]);
    assert.deepStrictEqual(namer.getNames(), {
        "1": ["A"],
        "2": ["B"],
        "3": ["BC"],
        "4": ["AC"],
        "5": ["CA"],
    });
});
