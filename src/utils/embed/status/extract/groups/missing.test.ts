import type { Snowflake } from "@discordjs/core";
import { describe, expect, test } from "bun:test";
import { Status } from "../..";
import { logger } from "../../../../../logger";
import { extractMissingGroups } from "./missing";

describe("extractMissingGroups", () => {
	test("empty input", () => {
		expect(extractMissingGroups([], { logger })).toStrictEqual([]);
	});

	test("1 member, pending", () => {
		expect(
			extractMissingGroups([{ name: "Trompette", members: [{ snowflake: "a" as Snowflake }] }], {
				logger,
			}),
		).toStrictEqual([]);
	});

	test("1 member, ok", () => {
		expect(
			extractMissingGroups(
				[{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Yes }] }],
				{ logger },
			),
		).toStrictEqual([]);
	});

	test("1 member, perhaps", () => {
		expect(
			extractMissingGroups(
				[{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Perhaps }] }],
				{ logger },
			),
		).toStrictEqual([]);
	});

	test("1 member, no", () => {
		expect(
			extractMissingGroups(
				[{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.No }] }],
				{ logger },
			),
		).toStrictEqual([{ groupName: "Trompette", overlaps: [] }]);
	});

	test("1 member overlapping, ok", () => {
		expect(
			extractMissingGroups(
				[
					{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Yes }] },
					{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Yes }] },
				],
				{ logger },
			),
		).toStrictEqual([
			{
				groupName: "Trompette",
				overlaps: [{ userSnowflake: "a" as Snowflake, otherGroupName: "Percus" }],
			},
			{
				groupName: "Percus",
				overlaps: [{ userSnowflake: "a" as Snowflake, otherGroupName: "Trompette" }],
			},
		]);
	});

	test("1 member overlapping, perhaps", () => {
		expect(
			extractMissingGroups(
				[
					{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Perhaps }] },
					{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Perhaps }] },
				],
				{ logger },
			),
		).toStrictEqual([
			{
				groupName: "Trompette",
				overlaps: [{ userSnowflake: "a" as Snowflake, otherGroupName: "Percus" }],
			},
			{
				groupName: "Percus",
				overlaps: [{ userSnowflake: "a" as Snowflake, otherGroupName: "Trompette" }],
			},
		]);
	});

	test("1 member overlapping, no", () => {
		expect(
			extractMissingGroups(
				[
					{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.No }] },
					{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.No }] },
				],
				{ logger },
			),
		).toStrictEqual([
			{ groupName: "Trompette", overlaps: [] },
			{ groupName: "Percus", overlaps: [] },
		]);
	});

	test("2 members, 1 overlapping, ok", () => {
		expect(
			extractMissingGroups(
				[
					{
						name: "Trompette",
						members: [
							{ snowflake: "a" as Snowflake, status: Status.Yes },
							{ snowflake: "b" as Snowflake, status: Status.Yes },
						],
					},
					{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Yes }] },
				],
				{ logger },
			),
		).toStrictEqual([
			{
				groupName: "Percus",
				overlaps: [{ userSnowflake: "a" as Snowflake, otherGroupName: "Trompette" }],
			},
		]);
	});

	test("2 members, 1 overlapping, perhaps", () => {
		expect(
			extractMissingGroups(
				[
					{
						name: "Trompette",
						members: [
							{ snowflake: "a" as Snowflake, status: Status.Yes },
							{ snowflake: "b" as Snowflake, status: Status.Perhaps },
						],
					},
					{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Yes }] },
				],
				{ logger },
			),
		).toStrictEqual([
			{
				groupName: "Percus",
				overlaps: [{ userSnowflake: "a" as Snowflake, otherGroupName: "Trompette" }],
			},
		]);
	});

	test("2 members, 1 overlapping, no", () => {
		expect(
			extractMissingGroups(
				[
					{
						name: "Trompette",
						members: [
							{ snowflake: "a" as Snowflake, status: Status.Yes },
							{ snowflake: "b" as Snowflake, status: Status.No },
						],
					},
					{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Yes }] },
				],
				{ logger },
			),
		).toStrictEqual([
			{
				groupName: "Trompette",
				overlaps: [{ userSnowflake: "a" as Snowflake, otherGroupName: "Percus" }],
			},
			{
				groupName: "Percus",
				overlaps: [{ userSnowflake: "a" as Snowflake, otherGroupName: "Trompette" }],
			},
		]);
	});
});
