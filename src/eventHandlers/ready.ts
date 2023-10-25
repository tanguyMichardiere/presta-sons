import type { API, APIGuildForumChannel, APITextChannel } from "@discordjs/core";
import { ChannelType, GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from ".";
import env from "../env";
import { command as mentionPendingCommand } from "../interactions/commands/mentionPending";
import { logger } from "../logger";

/** Check that the channel exists, and is a text channel or forum */
async function getChannel(api: API) {
  const channels = await api.guilds.getChannels(env.GUILD_ID);
  const channel = channels.find(
    (channel): channel is APITextChannel | APIGuildForumChannel =>
      channel.id === env.FORUM_ID &&
      (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildForum),
  );
  if (channel === undefined) {
    throw new Error(`Channel '${env.FORUM_ID}' not found or is not a text channel or forum`);
  }
  return channel;
}

export const handleReady = createEventHandler(
  GatewayDispatchEvents.Ready,
  async function ({ data, api }) {
    if (data.user.id !== env.APPLICATION_ID) {
      throw new Error(
        `Invalid application ID environment variable: expected '${data.user.id}' but got '${env.APPLICATION_ID}' instead`,
      );
    }
    const guild = await api.guilds.get(env.GUILD_ID);
    const channel = await getChannel(api);
    await api.applicationCommands.bulkOverwriteGuildCommands(env.APPLICATION_ID, env.GUILD_ID, [
      mentionPendingCommand,
    ]);
    logger.info({ data, guild, channel }, GatewayDispatchEvents.Ready);
  },
  { logEvent: false },
);
