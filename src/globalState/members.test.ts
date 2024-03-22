/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  type API,
  type RESTGetAPIGuildMembersResult,
  type RESTGetAPIGuildRolesResult,
} from "@discordjs/core";
import { describe, expect, mock, test } from "bun:test";
import { membersState, updateMembers } from "./members";

const api: API = {
  // @ts-expect-error partial mock
  guilds: {
    getRoles: mock(
      (guildId: "empty" | "simple"): Promise<RESTGetAPIGuildRolesResult> =>
        // @ts-expect-error partial mock
        Promise.resolve(
          {
            empty: [],
            simple: [{ id: "role-0", name: "ps Group 0" }],
          }[guildId],
        ),
    ),
    getMembers: mock(
      (guildId: "empty" | "simple"): Promise<RESTGetAPIGuildMembersResult> =>
        // @ts-expect-error partial mock
        Promise.resolve(
          {
            empty: [],
            simple: [{ user: { id: "user-0" }, id: "member-0", roles: ["role-0"] }],
          }[guildId],
        ),
    ),
  },
};

describe("updateMembers", function () {
  test("empty", async function () {
    await updateMembers(api, "empty");
    expect(membersState["empty"]).not.toBeUndefined();
    expect(membersState["empty"]!.adminRoleId).toBeUndefined();
    expect(membersState["empty"]!.pendingMembers).toHaveLength(0);
  });

  test("simple", async function () {
    await updateMembers(api, "simple");
    expect(membersState["simple"]).not.toBeUndefined();
    expect(membersState["simple"]!.adminRoleId).toBeUndefined();
    expect(membersState["simple"]!.pendingMembers).toHaveLength(1);
    expect(membersState["simple"]!.pendingMembers[0]!.groupName).toBe("Group 0");
    expect(membersState["simple"]!.pendingMembers[0]!.groupMembers).toHaveLength(1);
    expect(membersState["simple"]!.pendingMembers[0]!.groupMembers[0]!.id).toBe("user-0");
    expect(membersState["simple"]!.pendingMembers[0]!.groupMembers[0]!.status).toBeUndefined();
  });
});
