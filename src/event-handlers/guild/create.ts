import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import { updateMembers } from "../../global-state/members";

export const handleGuildCreate = createEventHandler(
	GatewayDispatchEvents.GuildCreate,
	async ({ data, api }) => {
		await updateMembers(api, data.id);
	},
	{ logEvent: false }, // guild create events are enormous, too large for Railway to parse the JSON
);
