import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import { updateMembers } from "../../global-state/members";

export const handleGuildMemberUpdate = createEventHandler(
	GatewayDispatchEvents.GuildMemberUpdate,
	async ({ data, api }) => {
		await updateMembers(api, data.guild_id);
	},
);
