import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import { updateMembers } from "../../global-state/members";
import { logger } from "../../logger";

export const handleGuildCreate = createEventHandler(
	GatewayDispatchEvents.GuildCreate,
	async ({ api, data }, { db }) => {
		logger.info({ event: { id: data.id, name: data.name } }, GatewayDispatchEvents.GuildCreate);
		await updateMembers(api, db, data.id);
	},
	{ logEvent: false }, // guild create events are enormous, too large for Railway to parse the JSON
);
