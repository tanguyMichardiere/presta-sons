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
	});
});
