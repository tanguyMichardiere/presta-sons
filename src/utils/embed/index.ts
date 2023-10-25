import type { APIEmbed, APIEmbedField } from "@discordjs/core";
import type { Members } from "../../globalState/members";
import { pendingMembers } from "../../globalState/members";
import { logger } from "../../logger";
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

export function membersFromEmbed(embed: APIEmbed, guildId: string): Members {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const members = structuredClone(pendingMembers[guildId]!);

  if (embed.fields === undefined) {
    logger.warn(embed, "embed has no fields");
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
    fields.push({
      name: `${Status.No} Pupitres manquants`,
      value: missing
        .map(({ groupName, overlaps }) =>
          overlaps !== undefined
            ? `${groupName} (si ${overlaps
                .map(({ userId, otherGroupName }) => `${tagFromId(userId)} -> ${otherGroupName}`)
                .join(" et ")})`
            : groupName,
        )
        .join(", "),
    });
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
