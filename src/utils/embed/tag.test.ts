import { describe, expect, test } from "bun:test";
import type { Snowflake } from "@discordjs/core";
import { snowflakeFromTag, tagFromSnowflake } from "./tag";

describe("idFromTag", () => {
	test("simple", () => {
		expect(snowflakeFromTag("<@id>")).toBe("id" as Snowflake);
	});

	test("long", () => {
		expect(snowflakeFromTag("<@veryLongSnowflake>")).toBe("veryLongSnowflake" as Snowflake);
	});
});

describe("tagFromSnowflake", () => {
	test("simple", () => {
		expect(tagFromSnowflake("id" as Snowflake)).toBe("<@id>");
	});

	test("long", () => {
		expect(tagFromSnowflake("veryLongSnowflake" as Snowflake)).toBe("<@veryLongSnowflake>");
	});
});
