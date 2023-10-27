import type {
  APIEmbed,
  APIGuildMember,
  APIMessage,
  APIMessageInteraction,
  APIUser,
} from "@discordjs/core";
import { ComponentType } from "@discordjs/core";
import { z } from "zod";
import { Snowflake } from "../../../schemas";
import { Status } from "../../../utils/embed/status";

export const SurveyButtonComponentInteractionData = z.object({
  id: Snowflake,
  token: z.string(),
  channel_id: Snowflake,
  guild_id: Snowflake,
  message: z
    .custom<APIMessage>((val) => val !== undefined)
    .refine(
      (val): val is APIMessage & { interaction: APIMessageInteraction; embeds: [APIEmbed] } =>
        val.interaction !== undefined && val.embeds.length === 1,
    ),
  member: z
    .custom<APIGuildMember>((val) => val !== undefined)
    .refine((val): val is APIGuildMember & { user: APIUser } => val.user !== undefined),
  data: z.object({
    component_type: z.literal(ComponentType.Button),
    custom_id: z.nativeEnum(Status),
  }),
});
export type SurveyButtonComponentInteractionData = z.infer<
  typeof SurveyButtonComponentInteractionData
>;
