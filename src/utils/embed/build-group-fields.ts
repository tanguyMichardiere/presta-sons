import type { APIEmbedField, Snowflake } from "@discordjs/core";
import type { Groups } from "../../global-state/groups";
import type { Status } from "./status";
import { tagFromSnowflake } from "./tag";

export const buildGroupFields = (groups: Groups): APIEmbedField[] =>
	groups.map(({ name: groupName, members: groupMembers }) => ({
		name: groupName,
		value: groupMembers
			.filter(
				(member): member is { snowflake: Snowflake; status: Status } => member.status !== undefined,
			)
			.map(({ snowflake, status }) => `${status} ${tagFromSnowflake(snowflake)}`)
			.join("\n"),
		inline: true,
	}));
