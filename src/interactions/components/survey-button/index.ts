import type { API } from "@discordjs/core";
import { MessageFlags } from "@discordjs/core";
import type { Db } from "../../../db";
import { logger } from "../../../logger";
import { parseChannelUrl, surveyComponentInteractionMessages } from "../../../messages";
import { embedFromGroups, informationsFromEmbed, membersFromEmbed } from "../../../utils/embed";
import { Status } from "../../../utils/embed/status";
import { tagFromSnowflake } from "../../../utils/embed/tag";
import type { SurveyButtonComponentInteractionData } from "./data";

export async function handleSurveyComponentInteraction(
	api: API,
	db: Db,
	data: SurveyButtonComponentInteractionData,
): Promise<void> {
	logger.debug({ componentInteractionData: data }, "updating survey results");
	const members = await membersFromEmbed(db, data.message.embeds[0], data.guild_id);
	const userSnowflake = data.member.user.id;
	const status = data.data.custom_id;

	for (const { members: groupMembers } of members) {
		for (const member of groupMembers) {
			if (member.snowflake === userSnowflake) {
				member.status = status;
			}
		}
	}

	if (status === Status.Ok && data.message.embeds[0].url !== undefined) {
		const threadSnowflake = parseChannelUrl(data.message.embeds[0].url)?.channelSnowflake;
		if (threadSnowflake !== undefined) {
			// PERMISSIONS: Send Messages in Threads
			// await api.threads.addMember(threadSnowflake, id);
			// alternative to avoid spamming with messages
			try {
				await api.threads.getMember(threadSnowflake, userSnowflake);
			} catch {
				// PERMISSIONS: Send Messages in Threads
				const message = await api.channels.createMessage(threadSnowflake, {
					content: surveyComponentInteractionMessages.temporaryMessage,
					flags: MessageFlags.SuppressNotifications,
				});
				await api.channels.editMessage(threadSnowflake, message.id, {
					content: tagFromSnowflake(userSnowflake),
				});
				await api.channels.deleteMessage(threadSnowflake, message.id);
			}
		} else {
			logger.warn(`invalid channel URL in embed: ${data.message.embeds[0].url}`);
		}
	}

	await api.interactions.updateMessage(data.id, data.token, {
		embeds: [
			embedFromGroups(members, {
				title: data.message.embeds[0].title,
				url: data.message.embeds[0].url,
				informations: informationsFromEmbed(data.message.embeds[0]),
			}),
		],
	});
}
