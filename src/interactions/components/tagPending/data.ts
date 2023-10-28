import type {
  APIInteractionDataResolved,
  APIInteractionDataResolvedChannel,
} from "@discordjs/core";
import { ComponentType } from "@discordjs/core";
import { z } from "zod";
import { Snowflake, snowflakeRegex } from "../../../schemas";

const customIdRegex = new RegExp(`tagPending-${snowflakeRegex.source}`);

export const TagPendingComponentInteractionData = z.object({
  id: Snowflake,
  token: z.string(),
  channel_id: Snowflake,
  guild_id: Snowflake,
  data: z
    .object({
      component_type: z.literal(ComponentType.ChannelSelect),
      custom_id: z.string().regex(customIdRegex),
      values: z.tuple([Snowflake]),
      resolved: z
        .custom<APIInteractionDataResolved>((val) => val !== undefined)
        .refine(
          (
            val,
          ): val is APIInteractionDataResolved & {
            channels: Record<string, APIInteractionDataResolvedChannel>;
          } => val.channels !== undefined,
        ),
    })
    .refine((val) => val.values[0] in val.resolved.channels),
});
export type TagPendingComponentInteractionData = z.infer<typeof TagPendingComponentInteractionData>;
