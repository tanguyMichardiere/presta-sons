import type {
  RESTPutAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationGuildCommandsJSONBody,
} from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType } from "@discordjs/core";
import { createSurveyCommandMessages } from "../../../messages";

export const createSurveyCommand: (
  | RESTPutAPIApplicationCommandsJSONBody
  | RESTPutAPIApplicationGuildCommandsJSONBody
)[number] = {
  type: ApplicationCommandType.ChatInput,
  name: createSurveyCommandMessages.commandName,
  description: createSurveyCommandMessages.commandDescription,
  options: [
    {
      name: createSurveyCommandMessages.nameOptionName,
      description: createSurveyCommandMessages.nameOptionDescription,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: createSurveyCommandMessages.threadOptionName,
      description: createSurveyCommandMessages.threadOptionDescription,
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.PublicThread],
    },
  ],
};
