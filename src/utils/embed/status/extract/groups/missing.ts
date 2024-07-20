import { Status } from "../..";
import type { Members } from "../../../../../global-state/members";
import { getGroupsByUserSnowflake } from "./get-groups-by-user-snowflake";

// TODO: add logging
export function extractMissingGroups(members: Members): Array<{
	groupName: string;
	overlaps?: Array<{ userSnowflake: string; otherGroupName: string }>;
}> {
	const result: Array<{
		groupName: string;
		overlaps?: Array<{ userSnowflake: string; otherGroupName: string }>;
	}> = [];
	const groupsByUserSnowflake = getGroupsByUserSnowflake(members);
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
				// biome-ignore lint/style/noNonNullAssertion:
				groupsByUserSnowflake[id]!.map((otherGroupName) => ({ userSnowflake: id, otherGroupName })),
			)
			.filter(({ otherGroupName }) => otherGroupName !== groupName);
		const overlappingUserIds = overlaps.map(({ userSnowflake }) => userSnowflake);
		if (
			overlaps.length > 0 &&
			notNoGroupMembers.every(({ id }) => overlappingUserIds.includes(id))
		) {
			result.push({ groupName, overlaps });
		}
	}
	return result;
}
