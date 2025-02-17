import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import { updateGroups } from "../../global-state/groups";
import { logger as baseLogger } from "../../logger";

export const handleGuildCreate = createEventHandler(
	GatewayDispatchEvents.GuildCreate,
	async ({ api, data }, { db, logger }) => {
		baseLogger.info({ event: { id: data.id, name: data.name } }, GatewayDispatchEvents.GuildCreate);
		await updateGroups(data.id, { api, db, logger });
	},
	{ logEvent: false }, // guild create events are enormous, too large for Railway to parse the JSON
);
