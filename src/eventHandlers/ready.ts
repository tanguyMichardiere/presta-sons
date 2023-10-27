import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from ".";
import { createSurveyCommand } from "../interactions/commands/createSurvey/command";
import { tagPendingCommand } from "../interactions/commands/tagPending/command";
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
