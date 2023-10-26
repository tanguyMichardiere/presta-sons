import { Status } from "..";
import type { Members } from "../../../../globalState/members";

export const extractPerhapsMissingGroups = (
  members: Members,
): Array<{ groupName: string; overlaps?: Array<{ userId: string; otherGroupName: string }> }> =>
  members
    // list groups where nobody said ok and not everybody said no
    .filter(
      ({ groupMembers }) =>
        groupMembers.every(({ status }) => status !== Status.Ok) &&
        !groupMembers.every(({ status }) => status === Status.No),
    )
    .map(({ groupName }) => ({ groupName }))
    // list groups where nobody said ok and the only members who said perhaps are also part of another group
    .concat(
      members
        .filter(({ groupMembers }) => groupMembers.every(({ status }) => status !== Status.Ok))
        .reduce<
          Array<{ groupName: string; overlaps: Array<{ userId: string; otherGroupName: string }> }>
        >(
          (groups, { groupName, groupMembers }) => [
            ...groups,
            ...groupMembers
              .filter(({ status }) => status === Status.Perhaps)
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
                ({ overlaps }) => overlaps.length > 0 && overlaps.length < groupMembers.length,
              ),
          ],
          [],
        ),
    )
    // list groups where some people said perhaps and the only members who said ok are also part of another group
    .concat(
      members
        .filter(({ groupMembers }) => groupMembers.some(({ status }) => status === Status.Perhaps))
        .reduce<
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
                ({ overlaps }) => overlaps.length > 0 && overlaps.length < groupMembers.length,
              ),
          ],
          [],
        ),
    );
