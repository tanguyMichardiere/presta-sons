import type { Members } from "../../../../global-state/members";
import { uniquePredicate } from "../../../unique-predicate";

export const extractPendingMembers = (members: Members): string[] =>
	members
		.flatMap(({ groupMembers }) => groupMembers)
		.filter(({ status }) => status === undefined)
		.map(({ id }) => id)
		.filter(uniquePredicate);
