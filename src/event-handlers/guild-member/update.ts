import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import { updateGroups } from "../../global-state/groups";

export const handleGuildMemberUpdate = createEventHandler(
	GatewayDispatchEvents.GuildMemberUpdate,
	async ({ api, data }, { db, logger }) => {
		await updateGroups(data.guild_id, { api, db, logger });
	},
);
