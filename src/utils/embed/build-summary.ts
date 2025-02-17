import type { APIEmbedFooter } from "@discordjs/core";
import type { Groups } from "../../global-state/groups";
import { Status } from "./status";

export function buildSummary(groups: Groups): APIEmbedFooter {
	const totals = {
		[Status.Yes]: new Set(),
		[Status.Perhaps]: new Set(),
		[Status.No]: new Set(),
	};
	for (const { members: groupMembers } of groups) {
		for (const { snowflake, status } of groupMembers) {
			if (status !== undefined) {
				totals[status].add(snowflake);
			}
		}
	}
	return {
		text: `${Status.Yes} ${totals[Status.Yes].size.toString()} - ${Status.Perhaps} ${totals[
			Status.Perhaps
		].size.toString()} - ${Status.No} ${totals[Status.No].size.toString()}`,
	};
}
