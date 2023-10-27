import type {
  RESTPutAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationGuildCommandsJSONBody,
} from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from ".";
import env from "../env";
import { createSurveyCommand } from "../interactions/commands/createSurvey/command";
import { editSurveyCommand } from "../interactions/commands/editSurvey.ts/command";
import { tagPendingCommand } from "../interactions/commands/tagPending/command";
import { logger } from "../logger";

const commands: RESTPutAPIApplicationCommandsJSONBody | RESTPutAPIApplicationGuildCommandsJSONBody =
  [createSurveyCommand, editSurveyCommand, tagPendingCommand];

export const handleReady = createEventHandler(
  GatewayDispatchEvents.Ready,
  async function ({ data, api }) {
    if (env.GUILD_ID !== undefined) {
      await api.applicationCommands.bulkOverwriteGuildCommands(
        data.user.id,
        env.GUILD_ID,
        commands,
      );
    } else {
      await api.applicationCommands.bulkOverwriteGlobalCommands(data.user.id, commands);
    }
    logger.info(data, GatewayDispatchEvents.Ready);
  },
  { logEvent: false },
);
