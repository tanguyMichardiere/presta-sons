import { describe, expect, test } from "bun:test";
import { extractPendingMembers } from "./pendingMembers";

describe("extractPendingMembers", () => {
	test("empty input", () => {
		expect(extractPendingMembers([])).toStrictEqual([]);
	});
});
