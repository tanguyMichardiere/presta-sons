import type { APIEmbedFooter } from "@discordjs/core";
import type { Groups } from "../../global-state/groups";
import { Status } from "./status";

export function buildSummary(members: Groups): APIEmbedFooter {
	const totals = {
		[Status.Ok]: new Set(),
		[Status.Perhaps]: new Set(),
		[Status.No]: new Set(),
	};
	for (const { members: groupMembers } of members) {
		for (const { snowflake, status } of groupMembers) {
			if (status !== undefined) {
				totals[status].add(snowflake);
			}
		}
	}
	return {
		text: `${Status.Ok} ${totals[Status.Ok].size.toString()} - ${Status.Perhaps} ${totals[
			Status.Perhaps
		].size.toString()} - ${Status.No} ${totals[Status.No].size.toString()}`,
	};
}
