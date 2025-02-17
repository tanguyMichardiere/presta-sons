import type { API, APIActionRowComponent, APIMessageActionRowComponent } from "@discordjs/core";
import { ButtonStyle, ChannelType, ComponentType } from "@discordjs/core";
import type { Db } from "../../../db";
import { getGroups } from "../../../global-state/groups";
import type { Logger } from "../../../logger";
import { channelUrl, createSurveyCommandMessages } from "../../../messages";
import { embedFromGroups } from "../../../utils/embed";
import { Status } from "../../../utils/embed/status";
import { exponentialBackoff } from "../../../utils/exponential-backoff";
import { InteractionError } from "../../error";
import { isAdmin } from "../is-admin";
import type { CreateSurveyCommandData } from "./data";

const components: APIActionRowComponent<APIMessageActionRowComponent>[] = [
	{
		type: ComponentType.ActionRow,
		components: [Status.Yes, Status.Perhaps, Status.No].map((status) => ({
			type: ComponentType.Button,
			style: ButtonStyle.Secondary,
			emoji: { name: status },
			custom_id: status,
		})),
	},
];

export async function handleCreateSurveyCommand(
	data: CreateSurveyCommandData,
	{ api, db, logger }: { api: API; db: Db; logger: Logger },
): Promise<void> {
	// biome-ignore lint/style/noNonNullAssertion:
	if (!(await isAdmin(data.member.user!.id, { guildSnowflake: data.guild_id, db }))) {
		throw new InteractionError(createSurveyCommandMessages.errors.userIsNotAdmin);
	}
	logger.debug({ commandData: data }, "creating a survey");
	const embedTitle = data.data.options?.find(
		(option) => option.name === createSurveyCommandMessages.nameOptionName,
	)?.value;
	let threadSnowflake = data.data.options?.find(
		(option) => option.name === createSurveyCommandMessages.threadOptionName,
	)?.value;
	if (threadSnowflake !== undefined) {
		// biome-ignore lint/style/noNonNullAssertion:
		threadSnowflake = data.data.resolved!.channels[threadSnowflake]!.id; // TODO why?
	} else if (data.channel.type === ChannelType.PublicThread) {
		threadSnowflake = data.channel.id;
	}
	const threadUrl =
		threadSnowflake !== undefined ? channelUrl(data.guild_id, threadSnowflake) : undefined;
	await api.interactions.reply(data.id, data.token, {
		embeds: [
			embedFromGroups(await getGroups(data.guild_id, { db }), {
				title: embedTitle,
				url: threadUrl,
				logger,
			}),
		],
		components,
	});
	const surveyMessage = await exponentialBackoff(
		() => api.interactions.getOriginalReply(data.application_id, data.token),
		{ logger },
	);
	// PERMISSIONS: Manage Messages
	await api.channels.pinMessage(data.channel.id, surveyMessage.id);
}
