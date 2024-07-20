import type {
	APIGuildMember,
	APIInteractionDataResolved,
	APIInteractionDataResolvedChannel,
	APIUser,
	Snowflake,
} from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType } from "@discordjs/core";
import { z } from "zod";
import { createSurveyCommandMessages } from "../../../messages";
import { SnowflakeSchema } from "../../../schemas";

export const CreateSurveyCommandData = z.object({
	id: SnowflakeSchema,
	token: z.string(),
	application_id: SnowflakeSchema,
	guild_id: SnowflakeSchema,
	channel: z.object({
		id: SnowflakeSchema,
		type: z.nativeEnum(ChannelType),
	}),
	member: z
		.custom<APIGuildMember>((val) => val !== undefined)
		.refine((val): val is APIGuildMember & { user: APIUser } => val.user !== undefined),
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
							value: SnowflakeSchema,
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
							channels: Record<Snowflake, APIInteractionDataResolvedChannel>;
						} => val.channels !== undefined,
					),
			),
		})
		.refine((val) => {
			const threadSnowflake = val.options?.find(
				(option) => option.name === createSurveyCommandMessages.threadOptionName,
			)?.value;
			return (
				threadSnowflake === undefined ||
				(val.resolved !== undefined && threadSnowflake in val.resolved.channels)
			);
		}),
});
export type CreateSurveyCommandData = z.infer<typeof CreateSurveyCommandData>;
