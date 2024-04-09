import { describe, expect, test } from "bun:test";
import { extractStatus } from ".";
import { Status } from "..";

describe("extractStatus", () => {
	test("empty input", () => {
		expect(extractStatus([])).toStrictEqual({});
	});

	test("no groups", () => {
		expect(extractStatus([{ name: "name", value: "value" }])).toStrictEqual({});
	});

	test("1 group, 1 person", () => {
		expect(
			extractStatus([{ name: "groupName", value: `${Status.Ok} <@personId>`, inline: true }]),
		).toStrictEqual({ groupName: { personId: Status.Ok } });
	});
});
