import type {
	APIInteractionDataResolved,
	APIInteractionDataResolvedChannel,
	Snowflake,
} from "@discordjs/core";
import { ComponentType } from "@discordjs/core";
import { z } from "zod";
import { SnowflakeSchema, snowflakeRegex } from "../../../schemas";

const customIdRegex = new RegExp(`tagPending-${snowflakeRegex.source}`);

export const TagPendingComponentInteractionData = z.object({
	id: SnowflakeSchema,
	token: z.string(),
	channel_id: SnowflakeSchema,
	guild_id: SnowflakeSchema,
	data: z
		.object({
			component_type: z.literal(ComponentType.ChannelSelect),
			custom_id: z.string().regex(customIdRegex),
			values: z.tuple([SnowflakeSchema]),
			resolved: z
				.custom<APIInteractionDataResolved>((val) => val !== undefined)
				.refine(
					(
						val,
					): val is APIInteractionDataResolved & {
						channels: Record<Snowflake, APIInteractionDataResolvedChannel>;
					} => val.channels !== undefined,
				),
		})
		.refine((val) => val.values[0] in val.resolved.channels),
});
export type TagPendingComponentInteractionData = z.infer<typeof TagPendingComponentInteractionData>;
