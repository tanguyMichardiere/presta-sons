import type { APIEmbed, APIEmbedField } from "@discordjs/core";
import type { Members } from "../../globalState/members";
import { pendingMembers } from "../../globalState/members";
import { logger } from "../../logger";
import { embedMessages } from "../../messages";
import { buildGroupFields } from "./buildGroupFields";
import { extractStatus } from "./status/extract";
import { extractMissingGroups } from "./status/extract/groups/missing";
import { extractPerhapsMissingGroups } from "./status/extract/groups/perhapsMissing";
import { extractPendingMembers } from "./status/extract/pendingMembers";
import { tagFromId } from "./tag";

const separator: APIEmbedField = { name: "", value: embedMessages.separator };

export const informationsFromEmbed = (embed: APIEmbed): string | undefined =>
  embed.fields?.find(({ name, inline }) => name === embedMessages.informations && inline !== true)
    ?.value;

export function membersFromEmbed(embed: APIEmbed, guildId: string): Members {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const members = structuredClone(pendingMembers[guildId]!);

  if (embed.fields === undefined) {
    logger.warn({ guildId, embed }, "embed has no fields");
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

type EmbedFromMembersOptions = {
  title: string;
  url: string;
  informations: string;
};

export function embedFromMembers(
  members: Members,
  { title = embedMessages.defaultTitle, url, informations }: Partial<EmbedFromMembersOptions> = {},
): APIEmbed {
  const fields: Array<APIEmbedField> = [];

  if (informations !== undefined) {
    fields.push({ name: embedMessages.informations, value: informations }, separator);
  }

  let needsSeparator = false;

  const pending = extractPendingMembers(members);
  if (pending.length > 0) {
    fields.push({ name: embedMessages.didntAnswer, value: pending.map(tagFromId).join(" ") });
    needsSeparator = true;
  }

  const missing = extractMissingGroups(members);
  if (missing.length > 0) {
    fields.push({
      name: embedMessages.missingGroups,
      value: embedMessages.missingGroupsField(missing),
    });
    needsSeparator = true;
  }

  const perhapsMissing = extractPerhapsMissingGroups(members);
  if (perhapsMissing.length > 0) {
    fields.push({
      name: embedMessages.perhapsMissingGroups,
      value: embedMessages.missingGroupsField(perhapsMissing),
    });
    needsSeparator = true;
  }

  if (needsSeparator) {
    fields.push(separator);
  }

  fields.push(...buildGroupFields(members));

  return { title, fields, url };
}
