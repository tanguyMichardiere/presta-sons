import type { Members } from "../../../../../globalState/members";

export const getGroupsByMemberId = (members: Members): Record<string, Array<string>> =>
  members
    .flatMap(({ groupName, groupMembers }) => groupMembers.map(({ id }) => ({ id, groupName })))
    .reduce<Record<string, Array<string>>>(function (result, { id, groupName }) {
      if (id in result) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        result[id]!.push(groupName);
      } else {
        result[id] = [groupName];
      }
      return result;
    }, {});
