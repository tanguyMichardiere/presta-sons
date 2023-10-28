import { ComponentType } from "@discordjs/core";
import { z } from "zod";
import { Snowflake, snowflakeRegex } from "../../../schemas";

const customIdRegex = new RegExp(`editSurvey-${snowflakeRegex.source}`);

export const EditSurveyComponentInteractionData = z.object({
  id: Snowflake,
  token: z.string(),
  channel_id: Snowflake,
  guild_id: Snowflake,
  data: z.object({
    custom_id: z.string().regex(customIdRegex),
    components: z.tuple([
      z.object({
        type: z.literal(ComponentType.ActionRow),
        components: z.tuple([
          z.object({
            type: z.literal(ComponentType.TextInput),
            custom_id: z.literal("title"),
            value: z.string(),
          }),
        ]),
      }),
      z.object({
        type: z.literal(ComponentType.ActionRow),
        components: z.tuple([
          z.object({
            type: z.literal(ComponentType.TextInput),
            custom_id: z.literal("url"),
            value: z.string(),
          }),
        ]),
      }),
      z.object({
        type: z.literal(ComponentType.ActionRow),
        components: z.tuple([
          z.object({
            type: z.literal(ComponentType.TextInput),
            custom_id: z.literal("informations"),
            value: z.string(),
          }),
        ]),
      }),
    ]),
  }),
});
export type EditSurveyComponentInteractionData = z.infer<typeof EditSurveyComponentInteractionData>;
