import type { APIEmbedFooter } from "@discordjs/core";
import type { Members } from "../../globalState/members";
import { Status } from "./status";

export function buildSummary(members: Members): APIEmbedFooter {
  const totals = {
    [Status.Ok]: new Set(),
    [Status.Perhaps]: new Set(),
    [Status.No]: new Set(),
    notAnswered: new Set(),
  };
  for (const { groupMembers } of members) {
    for (const { id, status } of groupMembers) {
      totals[status ?? "notAnswered"].add(id);
    }
  }
  const total =
    totals[Status.Ok].size +
    totals[Status.Perhaps].size +
    totals[Status.No].size +
    totals.notAnswered.size;
  return {
    text: `${Status.Ok} - ${totals[Status.Ok].size}/${total}\n${Status.Perhaps} - ${totals[Status.Perhaps].size}/${total}\n${Status.No} - ${totals[Status.No].size}/${total}\nNon répondu - ${totals.notAnswered.size}/${total}`,
  };
}
