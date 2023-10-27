import { Status } from "../..";
import type { Members } from "../../../../../globalState/members";
import { getGroupsByMemberId } from "./getGroupsByMemberId";

// TOOD: add logging
export function extractPerhapsMissingGroups(
  members: Members,
): Array<{ groupName: string; overlaps?: Array<{ userId: string; otherGroupName: string }> }> {
  const result: Array<{
    groupName: string;
    overlaps?: Array<{ userId: string; otherGroupName: string }>;
  }> = [];
  const groupsByMemberId = getGroupsByMemberId(members);
  // no answer is the same as having answered perhaps here
  for (const { groupName, groupMembers } of members.map(({ groupName, groupMembers }) => ({
    groupName,
    groupMembers: groupMembers.map(({ id, status }) => ({ id, status: status ?? Status.Perhaps })),
  }))) {
    if (groupMembers.some(({ status }) => status === Status.Perhaps)) {
      // include groups where nobody answered ok and some members answered perhaps
      if (groupMembers.every(({ status }) => status !== Status.Ok)) {
        result.push({ groupName });
        continue;
      }
      // include groups where some members answered perhaps and the only members who answered ok are part of another group
      const okGroupMembers = groupMembers.filter(({ status }) => status === Status.Ok);
      const overlaps = okGroupMembers
        .flatMap(({ id }) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          groupsByMemberId[id]!.map((otherGroupName) => ({ userId: id, otherGroupName })),
        )
        .filter(({ otherGroupName }) => otherGroupName !== groupName);
      const overlappingUserIds = overlaps.map(({ userId }) => userId);
      if (
        overlaps.length > 0 &&
        okGroupMembers.every(({ id }) => overlappingUserIds.includes(id))
      ) {
        result.push({ groupName, overlaps });
        continue;
      }
    }
  }
  return result;
}
