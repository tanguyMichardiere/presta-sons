import type { API, Snowflake } from "@discordjs/core";
import type { Db } from "../../../db";
import type { Logger } from "../../../logger";
import { messageUrl, tagPendingComponentInteractionMessages } from "../../../messages";
import { membersFromEmbed } from "../../../utils/embed";
import { extractPendingMembers } from "../../../utils/embed/status/extract/pending-members";
import type { TagPendingComponentInteractionData } from "./data";

export async function handleTagPendingComponentInteraction(
	data: TagPendingComponentInteractionData,
	{ api, db, logger }: { api: API; db: Db; logger: Logger },
): Promise<void> {
	// PERMISSIONS: Read Messages/View Channels + Read Message History
	const surveyMessage = await api.channels.getMessage(
		data.channel_id,
		// biome-ignore lint/style/noNonNullAssertion:
		data.data.custom_id.split("-")[1]! as Snowflake,
	);
	// biome-ignore lint/style/noNonNullAssertion:
	const channel = data.data.resolved.channels[data.data.values[0]]!;
	logger.debug(
		{ componentInteractionData: data },
		`tagging all pending members for ${surveyMessage.channel_id}/${surveyMessage.id} in ${channel.id}`,
	);
	// biome-ignore lint/style/noNonNullAssertion:
	const members = await membersFromEmbed(surveyMessage.embeds[0]!, data.guild_id, { db, logger });
	const pending = extractPendingMembers(members);
	// PERMISSIONS: Send Messages
	const tagMessage = await api.channels.createMessage(channel.id, {
		content: tagPendingComponentInteractionMessages.pleaseAnswer(
			pending,
			data.guild_id,
			surveyMessage,
		),
	});
	await api.interactions.updateMessage(data.id, data.token, {
		content: messageUrl(data.guild_id, channel.id, tagMessage.id),
		components: [],
	});
}
