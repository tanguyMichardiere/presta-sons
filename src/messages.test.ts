import type { Snowflake } from "@discordjs/core";
import { describe, expect, test } from "bun:test";
import { embedMessages } from "./messages";

describe("embedMessages", () => {
	describe("missingGroupsField", () => {
		test("empty", () => {
			expect(embedMessages.missingGroupsField([])).toBe("");
		});

		test("simple", () => {
			expect(embedMessages.missingGroupsField([{ groupName: "Trompette", overlaps: [] }])).toBe(
				"Trompette",
			);
		});

		test("1 overlapping", () => {
			expect(
				embedMessages.missingGroupsField([
					{
						groupName: "Trompette",
						overlaps: [{ userSnowflake: "id" as Snowflake, otherGroupName: "Percus" }],
					},
				]),
			).toBe("Trompette (si <@id> -> Percus)");
		});

		test("1 double overlapping", () => {
			expect(
				embedMessages.missingGroupsField([
					{
						groupName: "Trompette",
						overlaps: [
							{ userSnowflake: "id" as Snowflake, otherGroupName: "Percus" },
							{ userSnowflake: "id" as Snowflake, otherGroupName: "Trombone" },
						],
					},
				]),
			).toBe("Trompette (si <@id> -> Percus et <@id> -> Trombone)");
		});

		test("complex", () => {
			expect(
				embedMessages.missingGroupsField([
					{
						groupName: "group 8",
						overlaps: [
							{ otherGroupName: "group 4", userSnowflake: "e" as Snowflake },
							{ otherGroupName: "group 9", userSnowflake: "e" as Snowflake },
							{ otherGroupName: "group 9", userSnowflake: "q" as Snowflake },
							{ otherGroupName: "group 10", userSnowflake: "q" as Snowflake },
						],
					},
					{
						groupName: "group 9",
						overlaps: [
							{ otherGroupName: "group 4", userSnowflake: "e" as Snowflake },
							{ otherGroupName: "group 8", userSnowflake: "e" as Snowflake },
							{ otherGroupName: "group 8", userSnowflake: "q" as Snowflake },
							{ otherGroupName: "group 10", userSnowflake: "q" as Snowflake },
							{ otherGroupName: "group 6", userSnowflake: "m" as Snowflake },
						],
					},
				]),
			).toBe(
				"group 8 (si <@e> -> group 4 et <@e> -> group 9 et <@q> -> group 9 et <@q> -> group 10), group 9 (si <@e> -> group 4 et <@e> -> group 8 et <@q> -> group 8 et <@q> -> group 10 et <@m> -> group 6)",
			);
		});
	});
});
