import { describe, expect, test } from "bun:test";
import type { Snowflake } from "@discordjs/core";
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
						overlaps: [{ userSnowflake: "id" as Snowflake, otherGroupNames: ["Percus"] }],
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
							{ userSnowflake: "id" as Snowflake, otherGroupNames: ["Percus"] },
							{ userSnowflake: "id" as Snowflake, otherGroupNames: ["Trombone"] },
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
							{ userSnowflake: "e" as Snowflake, otherGroupNames: ["group 4", "group 9"] },
							{ userSnowflake: "q" as Snowflake, otherGroupNames: ["group 9", "group 10"] },
						],
					},
					{
						groupName: "group 9",
						overlaps: [
							{ userSnowflake: "e" as Snowflake, otherGroupNames: ["group 4", "group 8"] },
							{ userSnowflake: "q" as Snowflake, otherGroupNames: ["group 8", "group 10"] },
							{ userSnowflake: "m" as Snowflake, otherGroupNames: ["group 6"] },
						],
					},
				]),
			).toBe(
				"group 8 (si <@e> -> group 4 / group 9 et <@q> -> group 9 / group 10)\ngroup 9 (si <@e> -> group 4 / group 8 et <@q> -> group 8 / group 10 et <@m> -> group 6)",
			);
		});
	});
});
