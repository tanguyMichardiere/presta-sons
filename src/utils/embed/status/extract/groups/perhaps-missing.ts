import type { Snowflake } from "@discordjs/core";
import { Status } from "../..";
import type { Groups } from "../../../../../global-state/groups";
import type { Logger } from "../../../../../logger";
import { getGroupsByUserSnowflake } from "./get-groups-by-user-snowflake";

export function extractPerhapsMissingGroups(
	groups: Groups,
	{ logger }: { logger: Logger },
): {
	groupName: string;
	overlaps: { userSnowflake: Snowflake; otherGroupName: string }[];
}[] {
	const childLogger = logger.child({ groups });
	childLogger.debug("extracting perhaps missing groups");
	const result: {
		groupName: string;
		overlaps: { userSnowflake: Snowflake; otherGroupName: string }[];
	}[] = [];
	const groupsByUserSnowflake = getGroupsByUserSnowflake(groups);
	// no answer is the same as having answered perhaps here
	for (const { groupName, groupMembers } of groups.map(({ name, members }) => ({
		groupName: name,
		groupMembers: members.map(({ snowflake, status }) => ({
			snowflake,
			status: status ?? Status.Perhaps,
		})),
	}))) {
		// only include groups where some members answered perhaps
		if (groupMembers.some(({ status }) => status === Status.Perhaps)) {
			// include groups where nobody answered ok
			if (groupMembers.every(({ status }) => status !== Status.Ok)) {
				childLogger.debug({ groupName }, "including because nobody answered ok");
				result.push({ groupName, overlaps: [] });
				continue;
			}
			// include groups where the only members who answered ok are part of another group
			const okGroupMembers = groupMembers.filter(({ status }) => status === Status.Ok);
			const overlaps = okGroupMembers
				.flatMap(({ snowflake: userSnowflake }) =>
					// biome-ignore lint/style/noNonNullAssertion:
					groupsByUserSnowflake[userSnowflake]!.map((otherGroupName) => ({
						userSnowflake,
						otherGroupName,
					})),
				)
				.filter(({ otherGroupName }) => otherGroupName !== groupName);
			const overlappingUserIds = overlaps.map(({ userSnowflake }) => userSnowflake);
			if (
				overlaps.length > 0 &&
				okGroupMembers.every(({ snowflake }) => overlappingUserIds.includes(snowflake))
			) {
				result.push({ groupName, overlaps });
			}
		}
	}
	return result;
}
