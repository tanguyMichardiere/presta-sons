import type { API } from "@discordjs/core";
import { ChannelType, ComponentType, MessageFlags } from "@discordjs/core";
import type { Db } from "../../../db";
import { logger } from "../../../logger";
import { tagPendingCommandMessages } from "../../../messages";
import { membersFromEmbed } from "../../../utils/embed";
import { extractPendingMembers } from "../../../utils/embed/status/extract/pending-members";
import { InteractionError } from "../../error";
import { isAdmin } from "../is-admin";
import type { TagPendingCommandData } from "./data";

export async function handleTagPendingCommand(
	api: API,
	db: Db,
	data: TagPendingCommandData,
): Promise<void> {
	// biome-ignore lint/style/noNonNullAssertion:
	const surveyMessage = data.data.resolved.messages[data.data.target_id]!;
	if (surveyMessage.author.id !== data.application_id || surveyMessage.embeds.length !== 1) {
		throw new InteractionError(tagPendingCommandMessages.errors.onlyUsableOnSurveyMessage);
	}
	// biome-ignore lint/style/noNonNullAssertion:
	if (!(await isAdmin(db, data.guild_id, data.member.user!.id))) {
		throw new InteractionError(tagPendingCommandMessages.errors.userIsNotAdmin);
	}
	// biome-ignore lint/style/noNonNullAssertion:
	const members = await membersFromEmbed(db, surveyMessage.embeds[0]!, data.guild_id);
	const pending = extractPendingMembers(members);
	if (pending.length === 0) {
		throw new InteractionError(tagPendingCommandMessages.errors.everybodyAnswered);
	}
	logger.debug({ commandData: data }, "creating a tag prompt message with a channel select");
	await api.interactions.reply(data.id, data.token, {
		content: tagPendingCommandMessages.chooseTheChannel,
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.ChannelSelect,
						channel_types: [ChannelType.GuildText, ChannelType.PublicThread],
						custom_id: `tagPending-${surveyMessage.id}`,
					},
				],
			},
		],
		flags: MessageFlags.Ephemeral,
	});
}
