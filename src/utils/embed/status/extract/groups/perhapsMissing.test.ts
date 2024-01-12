import { describe, expect, test } from "vitest";
import { Status } from "../..";
import { extractPerhapsMissingGroups } from "./perhapsMissing";

describe("extractPerhapsMissingGroups", function () {
  test("empty input", function () {
    expect(extractPerhapsMissingGroups([])).toStrictEqual([]);
  });

  test("1 member, pending", function () {
    expect(
      extractPerhapsMissingGroups([{ groupName: "Trompette", groupMembers: [{ id: "a" }] }]),
    ).toStrictEqual([{ groupName: "Trompette" }]);
  });

  test("1 member, ok", function () {
    expect(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Ok }] },
      ]),
    ).toStrictEqual([]);
  });

  test("1 member, perhaps", function () {
    expect(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Perhaps }] },
      ]),
    ).toStrictEqual([{ groupName: "Trompette" }]);
  });

  test("1 member, no", function () {
    expect(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.No }] },
      ]),
    ).toStrictEqual([]);
  });

  test("1 member overlapping, ok", function () {
    expect(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Ok }] },
        { groupName: "Percus", groupMembers: [{ id: "a", status: Status.Ok }] },
      ]),
    ).toStrictEqual([]);
  });

  test("1 member overlapping, perhaps", function () {
    expect(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Perhaps }] },
        { groupName: "Percus", groupMembers: [{ id: "a", status: Status.Perhaps }] },
      ]),
    ).toStrictEqual([{ groupName: "Trompette" }, { groupName: "Percus" }]);
  });

  test("1 member overlapping, no", function () {
    expect(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.No }] },
        { groupName: "Percus", groupMembers: [{ id: "a", status: Status.No }] },
      ]),
    ).toStrictEqual([]);
  });

  test("2 members, 1 overlapping, ok", function () {
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

  test("2 members, 1 overlapping, perhaps", function () {
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
      { groupName: "Trompette", overlaps: [{ userId: "a", otherGroupName: "Percus" }] },
    ]);
  });

  test("2 members, 1 overlapping, no", function () {
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
