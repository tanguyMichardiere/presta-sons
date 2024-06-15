import type { API, APIActionRowComponent, APIMessageActionRowComponent } from "@discordjs/core";
import { ButtonStyle, ChannelType, ComponentType } from "@discordjs/core";
import { membersState } from "../../../global-state/members";
import { logger } from "../../../logger";
import { channelUrl, createSurveyCommandMessages } from "../../../messages";
import { embedFromMembers } from "../../../utils/embed";
import { Status } from "../../../utils/embed/status";
import { exponentialBackoff } from "../../../utils/exponential-backoff";
import { InteractionError } from "../../error";
import type { CreateSurveyCommandData } from "./data";

const components: APIActionRowComponent<APIMessageActionRowComponent>[] = [
	{
		type: ComponentType.ActionRow,
		components: [Status.Ok, Status.Perhaps, Status.No].map((status) => ({
			type: ComponentType.Button,
			style: ButtonStyle.Secondary,
			emoji: { name: status },
			custom_id: status,
		})),
	},
];

export async function handleCreateSurveyCommand(
	api: API,
	data: CreateSurveyCommandData,
): Promise<void> {
	// biome-ignore lint/style/noNonNullAssertion:
	const adminRoleId = membersState[data.guild_id]!.adminRoleId;
	if (adminRoleId === undefined) {
		throw new InteractionError(createSurveyCommandMessages.errors.adminRoleDoesntExist);
	}
	if (!data.member.roles.some((roleId) => roleId === adminRoleId)) {
		throw new InteractionError(createSurveyCommandMessages.errors.userIsNotAdmin);
	}
	logger.debug({ commandData: data }, "creating a survey");
	const embedTitle = data.data.options?.find(
		(option) => option.name === createSurveyCommandMessages.nameOptionName,
	)?.value;
	let threadId = data.data.options?.find(
		(option) => option.name === createSurveyCommandMessages.threadOptionName,
	)?.value;
	if (threadId !== undefined) {
		// biome-ignore lint/style/noNonNullAssertion:
		threadId = data.data.resolved!.channels[threadId]!.id;
	} else if (data.channel.type === ChannelType.PublicThread) {
		threadId = data.channel.id;
	}
	const threadUrl = threadId !== undefined ? channelUrl(data.guild_id, threadId) : undefined;
	await api.interactions.reply(data.id, data.token, {
		embeds: [
			// biome-ignore lint/style/noNonNullAssertion:
			embedFromMembers(membersState[data.guild_id]!.pendingMembers, {
				title: embedTitle,
				url: threadUrl,
			}),
		],
		components,
	});
	const surveyMessage = await exponentialBackoff(() =>
		api.interactions.getOriginalReply(data.application_id, data.token),
	);
	// PERMISSIONS: Manage Messages
	await api.channels.pinMessage(data.channel.id, surveyMessage.id);
}
