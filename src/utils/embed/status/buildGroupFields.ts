import type { APIEmbedField } from "@discordjs/core";
import type { Members } from "../../../globalState/members";
import { tagFromId } from "../tag";

export const buildGroupFields = (members: Members): Array<APIEmbedField> =>
  members.map(({ groupName, groupMembers }) => ({
    name: groupName,
    value: groupMembers
      .filter((member) => member.status !== undefined)
      .map(({ id, status }) => `${status} ${tagFromId(id)}`)
      .join("\n"),
    inline: true,
  }));
