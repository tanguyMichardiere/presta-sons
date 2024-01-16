import type {
  APIGuildMember,
  APIInteractionDataResolved,
  APIInteractionDataResolvedChannel,
} from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType } from "@discordjs/core";
import { z } from "zod";
import { createSurveyCommandMessages } from "../../../messages";
import { Snowflake } from "../../../schemas";

export const CreateSurveyCommandData = z.object({
  id: Snowflake,
  token: z.string(),
  application_id: Snowflake,
  guild_id: Snowflake,
  channel: z.object({
    id: Snowflake,
    type: z.nativeEnum(ChannelType),
  }),
  member: z.custom<APIGuildMember>((val) => val !== undefined),
  data: z
    .object({
      type: z.literal(ApplicationCommandType.ChatInput),
      name: z.literal(createSurveyCommandMessages.commandName),
      options: z.optional(
        z.array(
          z.union([
            z.object({
              name: z.literal(createSurveyCommandMessages.nameOptionName),
              type: z.literal(ApplicationCommandOptionType.String),
              value: z.string(),
            }),
            z.object({
              name: z.literal(createSurveyCommandMessages.threadOptionName),
              type: z.literal(ApplicationCommandOptionType.Channel),
              value: Snowflake,
            }),
          ]),
        ),
      ),
      resolved: z.optional(
        z
          .custom<APIInteractionDataResolved>((val) => val !== undefined)
          .refine(
            (
              val,
            ): val is APIInteractionDataResolved & {
              channels: Record<string, APIInteractionDataResolvedChannel>;
            } => val.channels !== undefined,
          ),
      ),
    })
    .refine(function (val) {
      const threadId = val.options?.find(
        (option) => option.name === createSurveyCommandMessages.threadOptionName,
      )?.value;
      return (
        threadId === undefined || (val.resolved !== undefined && threadId in val.resolved.channels)
      );
    }),
});
export type CreateSurveyCommandData = z.infer<typeof CreateSurveyCommandData>;
