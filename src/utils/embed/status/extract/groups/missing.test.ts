import { describe, expect, test } from "bun:test";
import { Status } from "../..";
import { extractMissingGroups } from "./missing";

describe("extractMissingGroups", () => {
	test("empty input", () => {
		expect(extractMissingGroups([])).toStrictEqual([]);
	});

	test("1 member, pending", () => {
		expect(
			extractMissingGroups([{ groupName: "Trompette", groupMembers: [{ id: "a" }] }]),
		).toStrictEqual([]);
	});

	test("1 member, ok", () => {
		expect(
			extractMissingGroups([
				{ groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Ok }] },
			]),
		).toStrictEqual([]);
	});

	test("1 member, perhaps", () => {
		expect(
			extractMissingGroups([
				{ groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Perhaps }] },
			]),
		).toStrictEqual([]);
	});

	test("1 member, no", () => {
		expect(
			extractMissingGroups([
				{ groupName: "Trompette", groupMembers: [{ id: "a", status: Status.No }] },
			]),
		).toStrictEqual([{ groupName: "Trompette" }]);
	});

	test("1 member overlapping, ok", () => {
		expect(
			extractMissingGroups([
				{ groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Ok }] },
				{ groupName: "Percus", groupMembers: [{ id: "a", status: Status.Ok }] },
			]),
		).toStrictEqual([
			{ groupName: "Trompette", overlaps: [{ userId: "a", otherGroupName: "Percus" }] },
			{ groupName: "Percus", overlaps: [{ userId: "a", otherGroupName: "Trompette" }] },
		]);
	});

	test("1 member overlapping, perhaps", () => {
		expect(
			extractMissingGroups([
				{ groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Perhaps }] },
				{ groupName: "Percus", groupMembers: [{ id: "a", status: Status.Perhaps }] },
			]),
		).toStrictEqual([
			{ groupName: "Trompette", overlaps: [{ userId: "a", otherGroupName: "Percus" }] },
			{ groupName: "Percus", overlaps: [{ userId: "a", otherGroupName: "Trompette" }] },
		]);
	});

	test("1 member overlapping, no", () => {
		expect(
			extractMissingGroups([
				{ groupName: "Trompette", groupMembers: [{ id: "a", status: Status.No }] },
				{ groupName: "Percus", groupMembers: [{ id: "a", status: Status.No }] },
			]),
		).toStrictEqual([{ groupName: "Trompette" }, { groupName: "Percus" }]);
	});

	test("2 members, 1 overlapping, ok", () => {
		expect(
			extractMissingGroups([
				{
					groupName: "Trompette",
					groupMembers: [
						{ id: "a", status: Status.Ok },
						{ id: "b", status: Status.Ok },
					],
				},
				{ groupName: "Percus", groupMembers: [{ id: "a", status: Status.Ok }] },
			]),
		).toStrictEqual([
			{ groupName: "Percus", overlaps: [{ userId: "a", otherGroupName: "Trompette" }] },
		]);
	});

	test("2 members, 1 overlapping, perhaps", () => {
		expect(
			extractMissingGroups([
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
			{ groupName: "Percus", overlaps: [{ userId: "a", otherGroupName: "Trompette" }] },
		]);
	});

	test("2 members, 1 overlapping, no", () => {
		expect(
			extractMissingGroups([
				{
					groupName: "Trompette",
					groupMembers: [
						{ id: "a", status: Status.Ok },
						{ id: "b", status: Status.No },
					],
				},
				{ groupName: "Percus", groupMembers: [{ id: "a", status: Status.Ok }] },
			]),
		).toStrictEqual([
			{ groupName: "Trompette", overlaps: [{ userId: "a", otherGroupName: "Percus" }] },
			{ groupName: "Percus", overlaps: [{ userId: "a", otherGroupName: "Trompette" }] },
		]);
	});
});
