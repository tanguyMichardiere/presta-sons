import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from ".";
import { command as createSurveyCommand } from "../interactions/commands/createSurvey";
import { command as tagPendingCommand } from "../interactions/commands/tagPending";
import { logger } from "../logger";

export const handleReady = createEventHandler(
  GatewayDispatchEvents.Ready,
  async function ({ data, api }) {
    await api.applicationCommands.bulkOverwriteGlobalCommands(data.user.id, [
      createSurveyCommand,
      tagPendingCommand,
    ]);
    logger.info(data, GatewayDispatchEvents.Ready);
  },
  { logEvent: false },
);
