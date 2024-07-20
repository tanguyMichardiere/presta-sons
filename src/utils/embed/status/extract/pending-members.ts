import type { Snowflake } from "@discordjs/core";
import type { Groups } from "../../../../global-state/members";
import { uniquePredicate } from "../../../unique-predicate";

export const extractPendingMembers = (members: Groups): Snowflake[] =>
	members
		.flatMap(({ members: groupMembers }) => groupMembers)
		.filter(({ status }) => status === undefined)
		.map(({ snowflake }) => snowflake)
		.filter(uniquePredicate);
