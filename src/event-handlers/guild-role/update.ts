import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import { updateMembers } from "../../global-state/members";

export const handleGuildRoleUpdate = createEventHandler(
	GatewayDispatchEvents.GuildRoleUpdate,
	async ({ data, api }) => {
		await updateMembers(api, data.guild_id);
	},
);
