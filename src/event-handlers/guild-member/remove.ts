import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import { updateGroups } from "../../global-state/groups";

export const handleGuildMemberRemove = createEventHandler(
	GatewayDispatchEvents.GuildMemberRemove,
	async ({ api, data }, { db }) => {
		await updateGroups(api, db, data.guild_id);
	},
);
