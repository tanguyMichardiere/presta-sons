import type { Members } from "../../../../globalState/members";

export const extractPendingMembers = (members: Members): Array<string> =>
  members
    .flatMap(({ groupMembers }) => groupMembers)
    .filter(({ status }) => status === undefined)
    .map(({ id }) => id)
    .filter((id, index, array) => array.indexOf(id) === index);
