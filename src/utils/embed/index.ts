import type { API, APIEmbed, APIEmbedField } from "@discordjs/core";
import type { Members } from "./members";
import { getMembersFromRoles } from "./members";
import {
  Status,
  buildGroupFields,
  extractMissingGroups,
  extractPendingMembers,
  extractPerhapsMissingGroups,
  extractStatus,
} from "./status";
import { tagFromId } from "./tag";

const separator: APIEmbedField = { name: "", value: "\b" };

export async function membersFromEmbed(api: API, embed: APIEmbed): Promise<Members> {
  const members = await getMembersFromRoles(api);

  if (embed.fields === undefined) {
    return members;
  }

  const statuses = extractStatus(embed.fields);
  for (const [groupName, groupMembers] of members) {
    for (const member of groupMembers) {
      member.status = statuses[groupName]?.[member.id];
    }
  }

  return members;
}

export function embedFromMembers(members: Members): APIEmbed {
  const fields: Array<APIEmbedField> = [];

  const pending = extractPendingMembers(members);
  if (pending.length > 0) {
    fields.push({ name: "Non répondu", value: pending.map(tagFromId).join(" ") });
  }

  const missing = extractMissingGroups(members);
  if (missing.length > 0) {
    fields.push({ name: `${Status.No} Pupitres manquants`, value: missing.join(", ") });
  }

  const perhapsMissing = extractPerhapsMissingGroups(members);
  if (perhapsMissing.length > 0) {
    fields.push({
      name: `${Status.Perhaps} Pupitres peut-être manquants`,
      value: perhapsMissing.join(", "),
    });
  }

  if (fields.length > 0) {
    fields.push(separator);
  }
  fields.push(...buildGroupFields(members));

  return { title: "Effectifs", fields };
}
