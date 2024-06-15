import type { Members } from "../../../../global-state/members";

export const extractPendingMembers = (members: Members): string[] =>
	members
		.flatMap(({ groupMembers }) => groupMembers)
		.filter(({ status }) => status === undefined)
		.map(({ id }) => id)
		.filter((id, index, array) => array.indexOf(id) === index);
