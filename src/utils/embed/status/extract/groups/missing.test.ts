import { describe, expect, test } from "bun:test";
import type { Snowflake } from "@discordjs/core";
import { Status } from "../..";
import { extractMissingGroups } from "./missing";

describe("extractMissingGroups", () => {
	test("empty input", () => {
		expect(extractMissingGroups([])).toStrictEqual([]);
	});

	test("1 member, pending", () => {
		expect(
			extractMissingGroups([{ name: "Trompette", members: [{ snowflake: "a" as Snowflake }] }]),
		).toStrictEqual([]);
	});

	test("1 member, ok", () => {
		expect(
			extractMissingGroups([
				{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
			]),
		).toStrictEqual([]);
	});

	test("1 member, perhaps", () => {
		expect(
			extractMissingGroups([
				{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Perhaps }] },
			]),
		).toStrictEqual([]);
	});

	test("1 member, no", () => {
		expect(
			extractMissingGroups([
				{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.No }] },
			]),
		).toStrictEqual([{ groupName: "Trompette" }]);
	});

	test("1 member overlapping, ok", () => {
		expect(
			extractMissingGroups([
				{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
				{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
			]),
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
			extractMissingGroups([
				{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Perhaps }] },
				{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Perhaps }] },
			]),
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
			extractMissingGroups([
				{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.No }] },
				{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.No }] },
			]),
		).toStrictEqual([{ groupName: "Trompette" }, { groupName: "Percus" }]);
	});

	test("2 members, 1 overlapping, ok", () => {
		expect(
			extractMissingGroups([
				{
					name: "Trompette",
					members: [
						{ snowflake: "a" as Snowflake, status: Status.Ok },
						{ snowflake: "b" as Snowflake, status: Status.Ok },
					],
				},
				{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
			]),
		).toStrictEqual([
			{
				groupName: "Percus",
				overlaps: [{ userSnowflake: "a" as Snowflake, otherGroupName: "Trompette" }],
			},
		]);
	});

	test("2 members, 1 overlapping, perhaps", () => {
		expect(
			extractMissingGroups([
				{
					name: "Trompette",
					members: [
						{ snowflake: "a" as Snowflake, status: Status.Ok },
						{ snowflake: "b" as Snowflake, status: Status.Perhaps },
					],
				},
				{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
			]),
		).toStrictEqual([
			{
				groupName: "Percus",
				overlaps: [{ userSnowflake: "a" as Snowflake, otherGroupName: "Trompette" }],
			},
		]);
	});

	test("2 members, 1 overlapping, no", () => {
		expect(
			extractMissingGroups([
				{
					name: "Trompette",
					members: [
						{ snowflake: "a" as Snowflake, status: Status.Ok },
						{ snowflake: "b" as Snowflake, status: Status.No },
					],
				},
				{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
			]),
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
