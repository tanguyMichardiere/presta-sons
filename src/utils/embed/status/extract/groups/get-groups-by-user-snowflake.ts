import type { Members } from "../../../../../global-state/members";

export const getGroupsByUserSnowflake = (members: Members): Record<string, string[]> =>
	members
		.flatMap(({ groupName, groupMembers }) => groupMembers.map(({ id }) => ({ id, groupName })))
		.reduce<Record<string, string[]>>((result, { id, groupName }) => {
			if (id in result) {
				// biome-ignore lint/style/noNonNullAssertion:
				result[id]!.push(groupName);
			} else {
				result[id] = [groupName];
			}
			return result;
		}, {});
