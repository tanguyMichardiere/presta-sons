import { describe, expect, test } from "bun:test";
import type { Snowflake } from "@discordjs/core";
import { Status } from "../..";
import { logger } from "../../../../../logger";
import { extractPerhapsMissingGroups } from "./perhaps-missing";

describe("extractPerhapsMissingGroups", () => {
	test("empty input", () => {
		expect(extractPerhapsMissingGroups([], { logger })).toStrictEqual([]);
	});

	test("1 member, pending", () => {
		expect(
			extractPerhapsMissingGroups(
				[{ name: "Trompette", members: [{ snowflake: "a" as Snowflake }] }],
				{ logger },
			),
		).toStrictEqual([{ groupName: "Trompette", overlaps: [] }]);
	});

	test("1 member, ok", () => {
		expect(
			extractPerhapsMissingGroups(
				[{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] }],
				{ logger },
			),
		).toStrictEqual([]);
	});

	test("1 member, perhaps", () => {
		expect(
			extractPerhapsMissingGroups(
				[{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Perhaps }] }],
				{ logger },
			),
		).toStrictEqual([{ groupName: "Trompette", overlaps: [] }]);
	});

	test("1 member, no", () => {
		expect(
			extractPerhapsMissingGroups(
				[{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.No }] }],
				{ logger },
			),
		).toStrictEqual([]);
	});

	test("1 member overlapping, ok", () => {
		expect(
			extractPerhapsMissingGroups(
				[
					{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
					{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
				],
				{ logger },
			),
		).toStrictEqual([]);
	});

	test("1 member overlapping, perhaps", () => {
		expect(
			extractPerhapsMissingGroups(
				[
					{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Perhaps }] },
					{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Perhaps }] },
				],
				{ logger },
			),
		).toStrictEqual([
			{ groupName: "Trompette", overlaps: [] },
			{ groupName: "Percus", overlaps: [] },
		]);
	});

	test("1 member overlapping, no", () => {
		expect(
			extractPerhapsMissingGroups(
				[
					{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.No }] },
					{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.No }] },
				],
				{ logger },
			),
		).toStrictEqual([]);
	});

	test("2 members, 1 overlapping, ok", () => {
		expect(
			extractPerhapsMissingGroups(
				[
					{
						name: "Trompette",
						members: [
							{ snowflake: "a" as Snowflake, status: Status.Ok },
							{ snowflake: "b" as Snowflake, status: Status.Ok },
						],
					},
					{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
				],
				{ logger },
			),
		).toStrictEqual([]);
	});

	test("2 members, 1 overlapping, perhaps", () => {
		expect(
			extractPerhapsMissingGroups(
				[
					{
						name: "Trompette",
						members: [
							{ snowflake: "a" as Snowflake, status: Status.Ok },
							{ snowflake: "b" as Snowflake, status: Status.Perhaps },
						],
					},
					{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
				],
				{ logger },
			),
		).toStrictEqual([
			{
				groupName: "Trompette",
				overlaps: [{ userSnowflake: "a" as Snowflake, otherGroupName: "Percus" }],
			},
		]);
	});

	test("2 members, 1 overlapping, no", () => {
		expect(
			extractPerhapsMissingGroups(
				[
					{
						name: "Trompette",
						members: [
							{ snowflake: "a" as Snowflake, status: Status.Ok },
							{ snowflake: "b" as Snowflake, status: Status.No },
						],
					},
					{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
				],
				{ logger },
			),
		).toStrictEqual([]);
	});
});
