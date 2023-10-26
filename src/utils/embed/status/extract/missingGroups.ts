import { Status } from "..";
import type { Members } from "../../../../globalState/members";

export const extractMissingGroups = (
  members: Members,
): Array<{ groupName: string; overlaps?: Array<{ userId: string; otherGroupName: string }> }> =>
  members
    // list groups where everybody said no
    .filter(({ groupMembers }) => groupMembers.every(({ status }) => status === Status.No))
    .map(({ groupName }) => ({ groupName }))
    // list groups where the only members who said ok are also part of another group
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
            .filter(
              ({ overlaps }) =>
                overlaps.length ===
                groupMembers.filter(({ status }) => status !== Status.No).length,
            ),
        ],
        [],
      ),
    );
