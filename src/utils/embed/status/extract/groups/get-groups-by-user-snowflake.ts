import type { Snowflake } from "@discordjs/core";
import type { Groups } from "../../../../../global-state/groups";

export const getGroupsByUserSnowflake = (groups: Groups): Record<Snowflake, string[]> =>
	groups
		.flatMap(({ name: groupName, members: groupMembers }) =>
			groupMembers.map(({ snowflake }) => ({ snowflake, groupName })),
		)
		.reduce<Record<Snowflake, string[]>>((result, { snowflake, groupName }) => {
			if (snowflake in result) {
				// biome-ignore lint/style/noNonNullAssertion:
				result[snowflake]!.push(groupName);
			} else {
				result[snowflake] = [groupName];
			}
			return result;
		}, {});
