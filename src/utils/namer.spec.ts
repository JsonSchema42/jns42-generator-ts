import assert from "node:assert";
import test from "node:test";
import { Namer } from "./namer.js";

test("namer", () => {
    const namer = new Namer(0);

    namer.registerName("1", "Good");

    assert.deepStrictEqual(
        namer.getName("1"),
        ["Good"],
    );

    namer.registerName("2", "Good");
    assert.deepStrictEqual(
        namer.getName("1"),
        ["Good", "1cbd3ut"],
    );
    assert.deepStrictEqual(
        namer.getName("2"),
        ["Good", "fayt8f"],
    );

    namer.registerName("3", "Good");
    assert.deepStrictEqual(
        namer.getName("1"),
        ["Good", "1cbd3ut"],
    );
    assert.deepStrictEqual(
        namer.getName("2"),
        ["Good", "fayt8f"],
    );
    assert.deepStrictEqual(
        namer.getName("3"),
        ["Good", "ht4wkp"],
    );
});
