import { Client, GatewayDispatchEvents, GatewayIntentBits } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import env from "./env";
import { handleInteractionCreate } from "./eventHandlers/interaction/create";
import { handleReady } from "./eventHandlers/ready";
import { handleThreadCreate } from "./eventHandlers/thread/create";
import { logger } from "./logger";

const rest = new REST().setToken(env.DISCORD_TOKEN);

const gateway = new WebSocketManager({
  token: env.DISCORD_TOKEN,
  intents: GatewayIntentBits.Guilds,
  rest,
});

const client = new Client({ rest, gateway });

client.once(GatewayDispatchEvents.Ready, handleReady);

client.on(GatewayDispatchEvents.ThreadCreate, handleThreadCreate);
client.on(GatewayDispatchEvents.InteractionCreate, handleInteractionCreate);

gateway.connect().catch(logger.error.bind(logger));
