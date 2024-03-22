import { Client, GatewayDispatchEvents, GatewayIntentBits } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import env from "./env";
import { handleGuildCreate } from "./eventHandlers/guild/create";
import { handleGuildMemberRemove } from "./eventHandlers/guildMember/remove";
import { handleGuildMemberUpdate } from "./eventHandlers/guildMember/update";
import { handleGuildRoleUpdate } from "./eventHandlers/guildRole/update";
import { handleInteractionCreate } from "./eventHandlers/interaction/create";
import { handleReady } from "./eventHandlers/ready";
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

gateway.connect().catch(function (reason) {
  logger.error(reason);
});
