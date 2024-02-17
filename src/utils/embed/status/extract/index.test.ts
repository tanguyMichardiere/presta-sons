import { describe, expect, test } from "bun:test";
import { extractStatus } from ".";
import { Status } from "..";

describe("extractStatus", function () {
  test("empty input", function () {
    expect(extractStatus([])).toStrictEqual({});
  });

  test("no groups", function () {
    expect(extractStatus([{ name: "name", value: "value" }])).toStrictEqual({});
  });

  test("1 group, 1 person", function () {
    expect(
      extractStatus([{ name: "groupName", value: `${Status.Ok} <@personId>`, inline: true }]),
    ).toStrictEqual({ groupName: { personId: Status.Ok } });
  });
});
