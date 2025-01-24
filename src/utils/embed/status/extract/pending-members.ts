import type { Snowflake } from "@discordjs/core";
import type { Groups } from "../../../../global-state/groups";
import { uniquePredicate } from "../../../unique-predicate";

export const extractPendingMembers = (groups: Groups): Snowflake[] =>
	groups
		.flatMap(({ members: groupMembers }) => groupMembers)
		.filter(({ status }) => status === undefined)
		.map(({ snowflake }) => snowflake)
		.filter(uniquePredicate);
