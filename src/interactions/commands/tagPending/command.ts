import type {
  RESTPutAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationGuildCommandsJSONBody,
} from "@discordjs/core";
import { ApplicationCommandType } from "@discordjs/core";
import { tagPendingCommandMessages } from "../../../messages";

export const tagPendingCommand: (
  | RESTPutAPIApplicationCommandsJSONBody
  | RESTPutAPIApplicationGuildCommandsJSONBody
)[number] = {
  type: ApplicationCommandType.Message,
  name: tagPendingCommandMessages.commandName,
};
