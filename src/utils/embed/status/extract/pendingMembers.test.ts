import { describe, expect, test } from "vitest";
import { extractPendingMembers } from "./pendingMembers";

describe("extractPendingMembers", function () {
  test("empty input", function () {
    expect(extractPendingMembers([])).toStrictEqual([]);
  });
});
