import type { Snowflake } from "@discordjs/core";
import { describe, expect, test } from "bun:test";
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
				[{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Yes }] }],
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
					{ name: "Trompette", members: [{ snowflake: "a" as Snowflake, status: Status.Yes }] },
					{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Yes }] },
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
							{ snowflake: "a" as Snowflake, status: Status.Yes },
							{ snowflake: "b" as Snowflake, status: Status.Yes },
						],
					},
					{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Yes }] },
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
							{ snowflake: "a" as Snowflake, status: Status.Yes },
							{ snowflake: "b" as Snowflake, status: Status.No },
						],
					},
					{ name: "Percus", members: [{ snowflake: "a" as Snowflake, status: Status.Yes }] },
				],
				{ logger },
			),
		).toStrictEqual([]);
	});

	test("complex", () => {
		expect(
			extractPerhapsMissingGroups(
				[
					{ members: [{ snowflake: "a" as Snowflake, status: Status.Yes }], name: "group 1" },
					{
						members: [
							{ snowflake: "b" as Snowflake, status: Status.Yes },
							{ snowflake: "c" as Snowflake },
						],
						name: "group 2",
					},
					{ members: [{ snowflake: "d" as Snowflake, status: Status.Yes }], name: "group 3" },
					{
						members: [
							{ snowflake: "e" as Snowflake, status: Status.Yes },
							{ snowflake: "f" as Snowflake, status: Status.Perhaps },
							{ snowflake: "g" as Snowflake, status: Status.Yes },
							{ snowflake: "h" as Snowflake },
						],
						name: "group 4",
					},
					{
						members: [
							{ snowflake: "i" as Snowflake, status: Status.Yes },
							{ snowflake: "j" as Snowflake },
						],
						name: "group 5",
					},
					{
						members: [
							{ snowflake: "k" as Snowflake, status: Status.Yes },
							{ snowflake: "l" as Snowflake },
							{ snowflake: "m" as Snowflake, status: Status.Yes },
						],
						name: "group 6",
					},
					{
						members: [
							{ snowflake: "n" as Snowflake, status: Status.Yes },
							{ snowflake: "o" as Snowflake },
							{ snowflake: "p" as Snowflake, status: Status.Yes },
						],
						name: "group 7",
					},
					{
						members: [
							{ snowflake: "e" as Snowflake, status: Status.Yes },
							{ snowflake: "q" as Snowflake, status: Status.Yes },
							{ snowflake: "r" as Snowflake },
						],
						name: "group 8",
					},
					{
						members: [
							{ snowflake: "e" as Snowflake, status: Status.Yes },
							{ snowflake: "q" as Snowflake, status: Status.Yes },
							{ snowflake: "s" as Snowflake },
							{ snowflake: "m" as Snowflake, status: Status.Yes },
						],
						name: "group 9",
					},
					{
						members: [
							{ snowflake: "q" as Snowflake, status: Status.Yes },
							{ snowflake: "t" as Snowflake },
							{ snowflake: "u" as Snowflake, status: Status.No },
							{ snowflake: "v" as Snowflake, status: Status.Yes },
						],
						name: "group 10",
					},
				],
				{ logger },
			),
		).toStrictEqual([
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
		]);
	});
});
