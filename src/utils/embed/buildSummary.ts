import type { APIEmbedFooter } from "@discordjs/core";
import type { Members } from "../../globalState/members";
import { Status } from "./status";

export function buildSummary(members: Members): APIEmbedFooter {
  const totals = {
    [Status.Ok]: new Set(),
    [Status.Perhaps]: new Set(),
    [Status.No]: new Set(),
  };
  for (const { groupMembers } of members) {
    for (const { id, status } of groupMembers) {
      if (status !== undefined) {
        totals[status].add(id);
      }
    }
  }
  return {
    text: `${Status.Ok} ${totals[Status.Ok].size} - ${Status.Perhaps} ${totals[Status.Perhaps].size} - ${Status.No} ${totals[Status.No].size}`,
  };
}
