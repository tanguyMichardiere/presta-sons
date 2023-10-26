import { deepEqual } from "node:assert/strict";
import { describe, it } from "node:test";
import { Status } from "..";
import { extractPerhapsMissingGroups } from "./perhapsMissingGroups";

void describe("extractPerhapsMissingGroups", async function () {
  await it("empty input", function () {
    deepEqual(extractPerhapsMissingGroups([]), []);
  });

  await it("1 member, pending", function () {
    deepEqual(
      extractPerhapsMissingGroups([{ groupName: "Trompette", groupMembers: [{ id: "a" }] }]),
      [{ groupName: "Trompette" }],
    );
  });

  await it("1 member, ok", function () {
    deepEqual(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Ok }] },
      ]),
      [],
    );
  });

  await it("1 member, perhaps", function () {
    deepEqual(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Perhaps }] },
      ]),
      [{ groupName: "Trompette" }],
    );
  });

  await it("1 member, no", function () {
    deepEqual(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.No }] },
      ]),
      [],
    );
  });

  await it("1 member overlapping, ok", function () {
    deepEqual(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Ok }] },
        { groupName: "Percus", groupMembers: [{ id: "a", status: Status.Ok }] },
      ]),
      [],
    );
  });

  await it("1 member overlapping, perhaps", function () {
    deepEqual(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Perhaps }] },
        { groupName: "Percus", groupMembers: [{ id: "a", status: Status.Perhaps }] },
      ]),
      [{ groupName: "Trompette" }, { groupName: "Percus" }],
    );
  });

  await it("1 member overlapping, no", function () {
    deepEqual(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.No }] },
        { groupName: "Percus", groupMembers: [{ id: "a", status: Status.No }] },
      ]),
      [],
    );
  });

  await it("2 members, 1 overlapping, ok", function () {
    deepEqual(
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
      [],
    );
  });

  await it("2 members, 1 overlapping, perhaps", function () {
    deepEqual(
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
      [{ groupName: "Trompette", overlaps: [{ userId: "a", otherGroupName: "Percus" }] }],
    );
  });

  await it("2 members, 1 overlapping, no", function () {
    deepEqual(
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
      [],
    );
  });
});
