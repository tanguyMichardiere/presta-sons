import type { RESTPutAPIApplicationGuildCommandsJSONBody } from "@discordjs/core";
import { ApplicationCommandType } from "@discordjs/core";
import { tagPendingCommandMessages } from "../../../messages";

export const tagPendingCommand: RESTPutAPIApplicationGuildCommandsJSONBody[number] = {
  type: ApplicationCommandType.Message,
  name: tagPendingCommandMessages.commandName,
};
