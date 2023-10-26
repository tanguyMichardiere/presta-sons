import type { APIEmbedField } from "@discordjs/core";
import type { Members } from "../../globalState/members";
import { idFromTag, tagFromId } from "./tag";

export enum Status {
  Ok = "✅",
  Perhaps = "❔",
  No = "❌",
}

/** @returns `Record<groupName, Record<memberId, Status>>` */
export const extractStatus = (
  fields: Array<APIEmbedField>,
): Record<string, Record<string, Status>> =>
  Object.fromEntries(
    fields
      .filter(({ value, inline }) => inline === true && value.length > 0)
      .map((field) => [
        field.name,
        Object.fromEntries(
          field.value.split("\n").map(function (line) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const [status, tag] = line.split(" ") as [Status, string];
            const id = idFromTag(tag);
            return [id, status];
          }),
        ),
      ]),
  );

export const extractPendingMembers = (members: Members): Array<string> =>
  members
    .map(({ groupMembers }) => groupMembers)
    .flat()
    .filter(({ status }) => status === undefined)
    .map(({ id }) => id)
    .filter((id, index, array) => array.indexOf(id) === index);

export const extractMissingGroups = (
  members: Members,
): Array<{ groupName: string; overlaps?: Array<{ userId: string; otherGroupName: string }> }> =>
  members
    // list groups where everybody said no
    .filter(({ groupMembers }) => groupMembers.every(({ status }) => status === Status.No))
    .map(({ groupName }) => ({ groupName }))
    // list groups where the only members who said yes are also part of another group
    .concat(
      members.reduce<
        Array<{ groupName: string; overlaps: Array<{ userId: string; otherGroupName: string }> }>
      >(
        (groups, { groupName, groupMembers }) => [
          ...groups,
          ...groupMembers
            .filter(({ status }) => status === Status.Ok)
            .map(({ id: userId }) => ({
              groupName,
              overlaps: members
                .filter(
                  ({ groupName: otherGroupName, groupMembers: otherGroupMembers }) =>
                    otherGroupName !== groupName &&
                    otherGroupMembers.map(({ id }) => id).includes(userId),
                )
                .map(({ groupName: otherGroupName }) => ({ userId, otherGroupName })),
            }))
            .filter(({ overlaps }) => overlaps.length > 0),
        ],
        [],
      ),
    );

export const extractPerhapsMissingGroups = (members: Members): Array<string> =>
  members
    // list groups where nobody said yes
    .filter(
      ({ groupMembers }) =>
        groupMembers.every(({ status }) => status !== Status.Ok) &&
        !groupMembers.every(({ status }) => status === Status.No),
    )
    .map(({ groupName }) => groupName);

export const buildGroupFields = (members: Members): Array<APIEmbedField> =>
  members.map(({ groupName, groupMembers }) => ({
    name: groupName,
    value: groupMembers
      .filter((member) => member.status !== undefined)
      .map(({ id, status }) => `${status} ${tagFromId(id)}`)
      .join("\n"),
    inline: true,
  }));
