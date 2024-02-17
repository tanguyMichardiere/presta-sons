import { describe, expect, test } from "bun:test";
import { idFromTag, tagFromId } from "./tag";

describe("idFromTag", function () {
  test("simple", function () {
    expect(idFromTag("<@id>")).toBe("id");
  });

  test("long", function () {
    expect(idFromTag("<@veryLongId>")).toBe("veryLongId");
  });
});

describe("tagFromId", function () {
  test("simple", function () {
    expect(tagFromId("id")).toBe("<@id>");
  });

  test("long", function () {
    expect(tagFromId("veryLongId")).toBe("<@veryLongId>");
  });
});
