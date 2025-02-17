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

	test("1 member, yes", () => {
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

	test("1 member overlapping, yes", () => {
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

	test("2 members, 1 overlapping, yes", () => {
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
				overlaps: [{ userSnowflake: "a" as Snowflake, otherGroupNames: ["Percus"] }],
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
					{ name: "group 1", members: [{ snowflake: "a" as Snowflake, status: Status.Yes }] },
					{
						name: "group 2",
						members: [
							{ snowflake: "b" as Snowflake, status: Status.Yes },
							{ snowflake: "c" as Snowflake },
						],
					},
					{ members: [{ snowflake: "d" as Snowflake, status: Status.Yes }], name: "group 3" },
					{
						name: "group 4",
						members: [
							{ snowflake: "e" as Snowflake, status: Status.Yes },
							{ snowflake: "f" as Snowflake, status: Status.Perhaps },
							{ snowflake: "g" as Snowflake, status: Status.Yes },
							{ snowflake: "h" as Snowflake },
						],
					},
					{
						name: "group 5",
						members: [
							{ snowflake: "i" as Snowflake, status: Status.Yes },
							{ snowflake: "j" as Snowflake },
						],
					},
					{
						name: "group 6",
						members: [
							{ snowflake: "k" as Snowflake, status: Status.Yes },
							{ snowflake: "l" as Snowflake },
							{ snowflake: "m" as Snowflake, status: Status.Yes },
						],
					},
					{
						name: "group 7",
						members: [
							{ snowflake: "n" as Snowflake, status: Status.Yes },
							{ snowflake: "o" as Snowflake },
							{ snowflake: "p" as Snowflake, status: Status.Yes },
						],
					},
					{
						name: "group 8",
						members: [
							{ snowflake: "e" as Snowflake, status: Status.Yes },
							{ snowflake: "q" as Snowflake, status: Status.Yes },
							{ snowflake: "r" as Snowflake },
						],
					},
					{
						name: "group 9",
						members: [
							{ snowflake: "e" as Snowflake, status: Status.Yes },
							{ snowflake: "q" as Snowflake, status: Status.Yes },
							{ snowflake: "s" as Snowflake },
							{ snowflake: "m" as Snowflake, status: Status.Yes },
						],
					},
					{
						name: "group 10",
						members: [
							{ snowflake: "q" as Snowflake, status: Status.Yes },
							{ snowflake: "t" as Snowflake },
							{ snowflake: "u" as Snowflake, status: Status.No },
							{ snowflake: "v" as Snowflake, status: Status.Yes },
						],
					},
				],
				{ logger },
			),
		).toStrictEqual([
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
		]);
	});
});
