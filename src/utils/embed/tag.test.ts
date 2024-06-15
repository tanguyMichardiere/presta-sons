import { describe, expect, test } from "bun:test";
import { idFromTag, tagFromId } from "./tag";

describe("idFromTag", () => {
	test("simple", () => {
		expect(idFromTag("<@id>")).toBe("id");
	});

	test("long", () => {
		expect(idFromTag("<@veryLongId>")).toBe("veryLongId");
	});
});

describe("tagFromId", () => {
	test("simple", () => {
		expect(tagFromId("id")).toBe("<@id>");
	});

	test("long", () => {
		expect(tagFromId("veryLongId")).toBe("<@veryLongId>");
	});
});
