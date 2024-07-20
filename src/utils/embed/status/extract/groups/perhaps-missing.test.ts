import { describe, expect, test } from "bun:test";
import { Status } from "../..";
import { extractPerhapsMissingGroups } from "./perhaps-missing";

describe("extractPerhapsMissingGroups", () => {
	test("empty input", () => {
		expect(extractPerhapsMissingGroups([])).toStrictEqual([]);
	});

	test("1 member, pending", () => {
		expect(
			extractPerhapsMissingGroups([{ groupName: "Trompette", groupMembers: [{ id: "a" }] }]),
		).toStrictEqual([{ groupName: "Trompette" }]);
	});

	test("1 member, ok", () => {
		expect(
			extractPerhapsMissingGroups([
				{ groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Ok }] },
			]),
		).toStrictEqual([]);
	});

	test("1 member, perhaps", () => {
		expect(
			extractPerhapsMissingGroups([
				{ groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Perhaps }] },
			]),
		).toStrictEqual([{ groupName: "Trompette" }]);
	});

	test("1 member, no", () => {
		expect(
			extractPerhapsMissingGroups([
				{ groupName: "Trompette", groupMembers: [{ id: "a", status: Status.No }] },
			]),
		).toStrictEqual([]);
	});

	test("1 member overlapping, ok", () => {
		expect(
			extractPerhapsMissingGroups([
				{ groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Ok }] },
				{ groupName: "Percus", groupMembers: [{ id: "a", status: Status.Ok }] },
			]),
		).toStrictEqual([]);
	});

	test("1 member overlapping, perhaps", () => {
		expect(
			extractPerhapsMissingGroups([
				{ groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Perhaps }] },
				{ groupName: "Percus", groupMembers: [{ id: "a", status: Status.Perhaps }] },
			]),
		).toStrictEqual([{ groupName: "Trompette" }, { groupName: "Percus" }]);
	});

	test("1 member overlapping, no", () => {
		expect(
			extractPerhapsMissingGroups([
				{ groupName: "Trompette", groupMembers: [{ id: "a", status: Status.No }] },
				{ groupName: "Percus", groupMembers: [{ id: "a", status: Status.No }] },
			]),
		).toStrictEqual([]);
	});

	test("2 members, 1 overlapping, ok", () => {
		expect(
			extractPerhapsMissingGroups([
				{
					groupName: "Trompette",
					groupMembers: [
						{ id: "a", status: Status.Ok },
						{ id: "b", status: Status.Ok },
					],
				},
				{ groupName: "Percus", groupMembers: [{ id: "a", status: Status.Ok }] },
			]),
		).toStrictEqual([]);
	});

	test("2 members, 1 overlapping, perhaps", () => {
		expect(
			extractPerhapsMissingGroups([
				{
					groupName: "Trompette",
					groupMembers: [
						{ id: "a", status: Status.Ok },
						{ id: "b", status: Status.Perhaps },
					],
				},
				{ groupName: "Percus", groupMembers: [{ id: "a", status: Status.Ok }] },
			]),
		).toStrictEqual([
			{ groupName: "Trompette", overlaps: [{ userSnowflake: "a", otherGroupName: "Percus" }] },
		]);
	});

	test("2 members, 1 overlapping, no", () => {
		expect(
			extractPerhapsMissingGroups([
				{
					groupName: "Trompette",
					groupMembers: [
						{ id: "a", status: Status.Ok },
						{ id: "b", status: Status.No },
					],
				},
				{ groupName: "Percus", groupMembers: [{ id: "a", status: Status.Ok }] },
			]),
		).toStrictEqual([]);
	});
});
