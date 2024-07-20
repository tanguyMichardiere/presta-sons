import type { Snowflake } from "@discordjs/core";
import { Status } from "../..";
import type { Groups } from "../../../../../global-state/members";
import { getGroupsByUserSnowflake } from "./get-groups-by-user-snowflake";

// TODO: add logging
export function extractMissingGroups(members: Groups): Array<{
	groupName: string;
	overlaps?: Array<{ userSnowflake: Snowflake; otherGroupName: string }>;
}> {
	const result: Array<{
		groupName: string;
		overlaps?: Array<{ userSnowflake: Snowflake; otherGroupName: string }>;
	}> = [];
	const groupsByUserSnowflake = getGroupsByUserSnowflake(members);
	for (const { name: groupName, members: groupMembers } of members) {
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
			.flatMap(({ snowflake: userSnowflake }) =>
				// biome-ignore lint/style/noNonNullAssertion:
				groupsByUserSnowflake[userSnowflake]!.map((otherGroupName) => ({
					userSnowflake,
					otherGroupName,
				})),
			)
			.filter(({ otherGroupName }) => otherGroupName !== groupName);
		const overlappingUserSnowflakes = overlaps.map(({ userSnowflake }) => userSnowflake);
		if (
			overlaps.length > 0 &&
			notNoGroupMembers.every(({ snowflake }) => overlappingUserSnowflakes.includes(snowflake))
		) {
			result.push({ groupName, overlaps });
		}
	}
	return result;
}
