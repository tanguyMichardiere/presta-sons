import { deepEqual } from "node:assert/strict";
import { describe, it } from "node:test";
import { Status } from "..";
import { extractMissingGroups } from "./missingGroups";

void describe("extractMissingGroups", async function () {
  await it("empty input", function () {
    deepEqual(extractMissingGroups([]), []);
  });

  await it("1 member, pending", function () {
    deepEqual(extractMissingGroups([{ groupName: "Trompette", groupMembers: [{ id: "a" }] }]), []);
  });

  await it("1 member, ok", function () {
    deepEqual(
      extractMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Ok }] },
      ]),
      [],
    );
  });

  await it("1 member, perhaps", function () {
    deepEqual(
      extractMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Perhaps }] },
      ]),
      [],
    );
  });

  await it("1 member, no", function () {
    deepEqual(
      extractMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.No }] },
      ]),
      [{ groupName: "Trompette" }],
    );
  });

  await it("1 member overlapping, ok", function () {
    deepEqual(
      extractMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Ok }] },
        { groupName: "Percus", groupMembers: [{ id: "a", status: Status.Ok }] },
      ]),
      [
        { groupName: "Trompette", overlaps: [{ userId: "a", otherGroupName: "Percus" }] },
        { groupName: "Percus", overlaps: [{ userId: "a", otherGroupName: "Trompette" }] },
      ],
    );
  });

  await it("1 member overlapping, perhaps", function () {
    deepEqual(
      extractMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Perhaps }] },
        { groupName: "Percus", groupMembers: [{ id: "a", status: Status.Perhaps }] },
      ]),
      [],
    );
  });

  await it("1 member overlapping, no", function () {
    deepEqual(
      extractMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.No }] },
        { groupName: "Percus", groupMembers: [{ id: "a", status: Status.No }] },
      ]),
      [{ groupName: "Trompette" }, { groupName: "Percus" }],
    );
  });

  await it("2 members, 1 overlapping, ok", function () {
    deepEqual(
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
      [{ groupName: "Percus", overlaps: [{ userId: "a", otherGroupName: "Trompette" }] }],
    );
  });

  await it("2 members, 1 overlapping, perhaps", function () {
    deepEqual(
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
      [{ groupName: "Percus", overlaps: [{ userId: "a", otherGroupName: "Trompette" }] }],
    );
  });

  await it("2 members, 1 overlapping, no", function () {
    deepEqual(
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
      [
        { groupName: "Trompette", overlaps: [{ userId: "a", otherGroupName: "Percus" }] },
        { groupName: "Percus", overlaps: [{ userId: "a", otherGroupName: "Trompette" }] },
      ],
    );
  });
});
