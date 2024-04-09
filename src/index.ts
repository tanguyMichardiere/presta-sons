import { Client, GatewayDispatchEvents, GatewayIntentBits } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import { env } from "./env";
import { handleGuildMemberRemove } from "./event-handlers/guild-member/remove";
import { handleGuildMemberUpdate } from "./event-handlers/guild-member/update";
import { handleGuildRoleUpdate } from "./event-handlers/guild-role/update";
import { handleGuildCreate } from "./event-handlers/guild/create";
import { handleInteractionCreate } from "./event-handlers/interaction/create";
import { handleReady } from "./event-handlers/ready";
import { logger } from "./logger";

const rest = new REST().setToken(env.DISCORD_TOKEN);

const gateway = new WebSocketManager({
	token: env.DISCORD_TOKEN,
	intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMembers,
	rest,
});

const client = new Client({ rest, gateway });

client.once(GatewayDispatchEvents.Ready, handleReady);

client.on(GatewayDispatchEvents.GuildCreate, handleGuildCreate);
client.on(GatewayDispatchEvents.GuildRoleUpdate, handleGuildRoleUpdate);
client.on(GatewayDispatchEvents.GuildMemberUpdate, handleGuildMemberUpdate);
client.on(GatewayDispatchEvents.GuildMemberRemove, handleGuildMemberRemove);
client.on(GatewayDispatchEvents.InteractionCreate, handleInteractionCreate);

gateway.connect().catch((reason) => {
	logger.error(reason);
});
