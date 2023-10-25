import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from ".";
import env from "../env";
import { command as createSurveyCommand } from "../interactions/commands/createSurvey";
import { logger } from "../logger";

export const handleReady = createEventHandler(
  GatewayDispatchEvents.Ready,
  async function ({ data, api }) {
    if (data.user.id !== env.APPLICATION_ID) {
      throw new Error(
        `Invalid application ID environment variable: expected '${data.user.id}' but got '${env.APPLICATION_ID}' instead`,
      );
    }
    await api.applicationCommands.bulkOverwriteGlobalCommands(env.APPLICATION_ID, [
      createSurveyCommand,
    ]);
    logger.info(data, GatewayDispatchEvents.Ready);
  },
  { logEvent: false },
);
