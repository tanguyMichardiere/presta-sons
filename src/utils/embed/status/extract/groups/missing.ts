import type { Snowflake } from "@discordjs/core";
import { Status } from "../..";
import type { Groups } from "../../../../../global-state/groups";
import type { Logger } from "../../../../../logger";
import { getGroupsByUserSnowflake } from "./get-groups-by-user-snowflake";

export function extractMissingGroups(
	groups: Groups,
	{ logger }: { logger: Logger },
): { groupName: string; overlaps: { userSnowflake: Snowflake; otherGroupNames: string[] }[] }[] {
	const childLogger = logger.child({ groups });
	childLogger.debug("extracting missing groups");
	const result: {
		groupName: string;
		overlaps: { userSnowflake: Snowflake; otherGroupNames: string[] }[];
	}[] = [];
	const groupsByUserSnowflake = getGroupsByUserSnowflake(groups);
	for (const { name: groupName, members: groupMembers } of groups) {
		// exclude groups where not everybody answered
		if (groupMembers.some(({ status }) => status === undefined)) {
			childLogger.debug({ groupName }, "excluding because not everybody answered");
			continue;
		}
		// include groups where everybody answered no
		if (groupMembers.every(({ status }) => status === Status.No)) {
			childLogger.debug({ groupName }, "including because everybody answered no");
			result.push({ groupName, overlaps: [] });
			continue;
		}
		// include groups where the only members who answered perhaps or yes are also part of another group
		const notNoGroupMembers = groupMembers.filter(({ status }) => status !== Status.No);
		const overlaps = notNoGroupMembers
			.map(({ snowflake: userSnowflake }) => ({
				userSnowflake,
				// biome-ignore lint/style/noNonNullAssertion:
				otherGroupNames: groupsByUserSnowflake[userSnowflake]!.filter(
					(otherGroupName) => otherGroupName !== groupName,
				),
			}))
			.filter(({ otherGroupNames }) => otherGroupNames.length > 0);
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
