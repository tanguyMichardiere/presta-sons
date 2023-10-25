import assert from "node:assert/strict";
import test from "node:test";
import { extractStatus } from "./status";

void test("extractStatus", async function (t) {
  await t.test("empty input", function () {
    assert.deepEqual(extractStatus([]), {});
  });

  await t.test("1 group, no member", function () {
    assert.deepEqual(extractStatus([{ name: "Trompette", value: "" }]), {});
  });
});
