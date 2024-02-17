import { describe, expect, test } from "bun:test";
import { extractPendingMembers } from "./pendingMembers";

describe("extractPendingMembers", function () {
  test("empty input", function () {
    expect(extractPendingMembers([])).toStrictEqual([]);
  });
});
