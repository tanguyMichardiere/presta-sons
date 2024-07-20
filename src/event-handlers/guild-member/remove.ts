import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import { updateMembers } from "../../global-state/members";

export const handleGuildMemberRemove = createEventHandler(
	GatewayDispatchEvents.GuildMemberRemove,
	async ({ api, data }, { db }) => {
		await updateMembers(api, db, data.guild_id);
	},
);
