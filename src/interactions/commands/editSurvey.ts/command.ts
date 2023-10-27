import type {
  RESTPutAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationGuildCommandsJSONBody,
} from "@discordjs/core";
import { ApplicationCommandType } from "@discordjs/core";
import { editSurveyCommandMessages } from "../../../messages";

export const editSurveyCommand: (
  | RESTPutAPIApplicationCommandsJSONBody
  | RESTPutAPIApplicationGuildCommandsJSONBody
)[number] = {
  type: ApplicationCommandType.Message,
  name: editSurveyCommandMessages.commandName,
};
