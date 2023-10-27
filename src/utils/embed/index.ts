import type { APIEmbed, APIEmbedField } from "@discordjs/core";
import type { Members } from "../../globalState/members";
import { pendingMembers } from "../../globalState/members";
import { logger } from "../../logger";
import { embedMessages } from "../../messages";
import { buildGroupFields } from "./status/buildGroupFields";
import { extractStatus } from "./status/extract";
import { extractMissingGroups } from "./status/extract/missingGroups";
import { extractPendingMembers } from "./status/extract/pendingMembers";
import { extractPerhapsMissingGroups } from "./status/extract/perhapsMissingGroups";
import { tagFromId } from "./tag";

const separator: APIEmbedField = { name: "", value: embedMessages.separator };

export function membersFromEmbed(embed: APIEmbed, guildId: string): Members {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const members = structuredClone(pendingMembers[guildId]!);

  if (embed.fields === undefined) {
    logger.warn(embed, "embed has no fields");
    return members;
  }

  const statuses = extractStatus(embed.fields);
  for (const { groupName, groupMembers } of members) {
    for (const member of groupMembers) {
      member.status = statuses[groupName]?.[member.id];
    }
  }

  return members;
}

export function embedFromMembers(
  members: Members,
  title = embedMessages.defaultTitle,
  url?: string,
): APIEmbed {
  const fields: Array<APIEmbedField> = [];

  const pending = extractPendingMembers(members);
  if (pending.length > 0) {
    fields.push({ name: embedMessages.didntAnswer, value: pending.map(tagFromId).join(" ") });
  }

  const missing = extractMissingGroups(members);
  if (missing.length > 0) {
    fields.push({
      name: embedMessages.missingGroups,
      value: embedMessages.missingGroupsField(missing),
    });
  }

  const perhapsMissing = extractPerhapsMissingGroups(members);
  if (perhapsMissing.length > 0) {
    fields.push({
      name: embedMessages.perhapsMissingGroups,
      value: embedMessages.missingGroupsField(perhapsMissing),
    });
  }

  if (fields.length > 0) {
    fields.push(separator);
  }
  fields.push(...buildGroupFields(members));

  return { title, fields, url };
}
