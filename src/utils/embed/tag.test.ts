import { describe, expect, test } from "bun:test";
import { snowflakeFromTag, tagFromSnowflake } from "./tag";

describe("idFromTag", () => {
	test("simple", () => {
		expect(snowflakeFromTag("<@id>")).toBe("id");
	});

	test("long", () => {
		expect(snowflakeFromTag("<@veryLongSnowflake>")).toBe("veryLongSnowflake");
	});
});

describe("tagFromSnowflake", () => {
	test("simple", () => {
		expect(tagFromSnowflake("id")).toBe("<@id>");
	});

	test("long", () => {
		expect(tagFromSnowflake("veryLongSnowflake")).toBe("<@veryLongSnowflake>");
	});
});
