import { describe, expect, test } from "bun:test";
import { extractPendingMembers } from "./pending-members";

describe("extractPendingMembers", () => {
	test("empty input", () => {
		expect(extractPendingMembers([])).toStrictEqual([]);
	});
});
