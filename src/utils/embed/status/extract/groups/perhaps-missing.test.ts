import { describe, expect, test } from "bun:test";
import type { Snowflake } from "@discordjs/core";
import { Status } from "../..";
import { extractPerhapsMissingGroups } from "./perhaps-missing";

describe("extractPerhapsMissingGroups", () => {
	test("empty input", () => {
		expect(extractPerhapsMissingGroups([])).toStrictEqual([]);
	});

	test("1 member, pending", () => {
		expect(
			extractPerhapsMissingGroups([
				{ name: "Trompette", members: [{ snowflake: "a" as Snowflake }] },
			]),
		).toStrictEqual([{ groupName: "Trompette" }]);
	});

	test("1 member, ok", () => {
		expect(
			extractPerhapsMissingGroups([
				{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
			]),
		).toStrictEqual([]);
	});

	test("1 member, perhaps", () => {
		expect(
			extractPerhapsMissingGroups([
				{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Perhaps }] },
			]),
		).toStrictEqual([{ groupName: "Trompette" }]);
	});

	test("1 member, no", () => {
		expect(
			extractPerhapsMissingGroups([
				{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.No }] },
			]),
		).toStrictEqual([]);
	});

	test("1 member overlapping, ok", () => {
		expect(
			extractPerhapsMissingGroups([
				{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
				{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
			]),
		).toStrictEqual([]);
	});

	test("1 member overlapping, perhaps", () => {
		expect(
			extractPerhapsMissingGroups([
				{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Perhaps }] },
				{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Perhaps }] },
			]),
		).toStrictEqual([{ groupName: "Trompette" }, { groupName: "Percus" }]);
	});

	test("1 member overlapping, no", () => {
		expect(
			extractPerhapsMissingGroups([
				{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.No }] },
				{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.No }] },
			]),
		).toStrictEqual([]);
	});

	test("2 members, 1 overlapping, ok", () => {
		expect(
			extractPerhapsMissingGroups([
				{
					name: "Trompette",
					members: [
						{ snowflake: "a" as Snowflake, status: Status.Ok },
						{ snowflake: "b" as Snowflake, status: Status.Ok },
					],
				},
				{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
			]),
		).toStrictEqual([]);
	});

	test("2 members, 1 overlapping, perhaps", () => {
		expect(
			extractPerhapsMissingGroups([
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
				groupName: "Trompette",
				overlaps: [{ userSnowflake: "a" as Snowflake, otherGroupName: "Percus" }],
			},
		]);
	});

	test("2 members, 1 overlapping, no", () => {
		expect(
			extractPerhapsMissingGroups([
				{
					name: "Trompette",
					members: [
						{ snowflake: "a" as Snowflake, status: Status.Ok },
						{ snowflake: "b" as Snowflake, status: Status.No },
					],
				},
				{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Ok }] },
			]),
		).toStrictEqual([]);
	});
});
