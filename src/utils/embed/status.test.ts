import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Status, extractMissingGroups, extractPerhapsMissingGroups } from "./status";

void describe("extractMissingGroups", async function () {
  await it("empty input", function () {
    assert.deepEqual(extractMissingGroups([]), []);
  });

  await it("1 member, pending", function () {
    assert.deepEqual(
      extractMissingGroups([{ groupName: "Trompette", groupMembers: [{ id: "a" }] }]),
      [],
    );
  });

  await it("1 member, ok", function () {
    assert.deepEqual(
      extractMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Ok }] },
      ]),
      [],
    );
  });

  await it("1 member, perhaps", function () {
    assert.deepEqual(
      extractMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Perhaps }] },
      ]),
      [],
    );
  });

  await it("1 member, no", function () {
    assert.deepEqual(
      extractMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.No }] },
      ]),
      [{ groupName: "Trompette" }],
    );
  });

  await it("1 member overlapping, ok", function () {
    assert.deepEqual(
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
    assert.deepEqual(
      extractMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Perhaps }] },
        { groupName: "Percus", groupMembers: [{ id: "a", status: Status.Perhaps }] },
      ]),
      [],
    );
  });

  await it("1 member overlapping, no", function () {
    assert.deepEqual(
      extractMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.No }] },
        { groupName: "Percus", groupMembers: [{ id: "a", status: Status.No }] },
      ]),
      [{ groupName: "Trompette" }, { groupName: "Percus" }],
    );
  });
});

void describe("extractPerhapsMissingGroups", async function () {
  await it("empty input", function () {
    assert.deepEqual(extractPerhapsMissingGroups([]), []);
  });

  await it("1 member, pending", function () {
    assert.deepEqual(
      extractPerhapsMissingGroups([{ groupName: "Trompette", groupMembers: [{ id: "a" }] }]),
      ["Trompette"],
    );
  });

  await it("1 member, ok", function () {
    assert.deepEqual(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Ok }] },
      ]),
      [],
    );
  });

  await it("1 member, perhaps", function () {
    assert.deepEqual(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Perhaps }] },
      ]),
      ["Trompette"],
    );
  });

  await it("1 member, no", function () {
    assert.deepEqual(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.No }] },
      ]),
      [],
    );
  });

  await it("1 member overlapping, ok", function () {
    assert.deepEqual(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Ok }] },
        { groupName: "Percus", groupMembers: [{ id: "a", status: Status.Ok }] },
      ]),
      [],
    );
  });

  await it("1 member overlapping, perhaps", function () {
    assert.deepEqual(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.Perhaps }] },
        { groupName: "Percus", groupMembers: [{ id: "a", status: Status.Perhaps }] },
      ]),
      ["Trompette", "Percus"],
    );
  });

  await it("1 member overlapping, no", function () {
    assert.deepEqual(
      extractPerhapsMissingGroups([
        { groupName: "Trompette", groupMembers: [{ id: "a", status: Status.No }] },
        { groupName: "Percus", groupMembers: [{ id: "a", status: Status.No }] },
      ]),
      [],
    );
  });
});
