import { Status } from "../..";
import type { Members } from "../../../../../globalState/members";
import { getGroupsByMemberId } from "./getGroupsByMemberId";

export function extractMissingGroups(
  members: Members,
): Array<{ groupName: string; overlaps?: Array<{ userId: string; otherGroupName: string }> }> {
  const result: Array<{
    groupName: string;
    overlaps?: Array<{ userId: string; otherGroupName: string }>;
  }> = [];
  const groupsByMemberId = getGroupsByMemberId(members);
  for (const { groupName, groupMembers } of members) {
    // exclude groups where not everybody answered
    if (groupMembers.some(({ status }) => status === undefined)) {
      continue;
    }
    // include groups where everybody answered no
    if (groupMembers.every(({ status }) => status === Status.No)) {
      result.push({ groupName });
      continue;
    }
    // include groups where the only members who answered perhaps or ok are also part of another group
    const notNoGroupMembers = groupMembers.filter(({ status }) => status !== Status.No);
    const overlaps = notNoGroupMembers
      .flatMap(({ id }) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        groupsByMemberId[id]!.map((otherGroupName) => ({ userId: id, otherGroupName })),
      )
      .filter(({ otherGroupName }) => otherGroupName !== groupName);
    const overlappingUserIds = overlaps.map(({ userId }) => userId);
    if (
      overlaps.length > 0 &&
      notNoGroupMembers.every(({ id }) => overlappingUserIds.includes(id))
    ) {
      result.push({ groupName, overlaps });
      continue;
    }
  }
  return result;
}
