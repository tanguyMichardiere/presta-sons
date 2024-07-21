import type { API, Snowflake } from "@discordjs/core";
import { ChannelType } from "@discordjs/core";
import type { Db } from "../../../db";
import { logger } from "../../../logger";
import { editSurveyComponentInteractionMessages, parseChannelUrl } from "../../../messages";
import { embedFromMembers, membersFromEmbed } from "../../../utils/embed";
import { InteractionError } from "../../error";
import type { EditSurveyComponentInteractionData } from "./data";

const notEmptyOrUndefined = (string: string) => (string !== "" ? string : undefined);

export async function handleEditSurveyComponentInteraction(
	api: API,
	db: Db,
	data: EditSurveyComponentInteractionData,
): Promise<void> {
	const title = notEmptyOrUndefined(data.data.components[0].components[0].value);
	const url = notEmptyOrUndefined(data.data.components[1].components[0].value);
	const informations = notEmptyOrUndefined(data.data.components[2].components[0].value);
	if (url !== undefined) {
		const match = parseChannelUrl(url);
		if (match === undefined) {
			throw new InteractionError(editSurveyComponentInteractionMessages.errors.invalidChannelUrl);
		}
		try {
			const thread = await api.channels.get(match.channelSnowflake);
			if (thread.type !== ChannelType.PublicThread) {
				throw new InteractionError(editSurveyComponentInteractionMessages.errors.notAThread);
			}
		} catch (cause) {
			throw new InteractionError(editSurveyComponentInteractionMessages.errors.channelNotFound, {
				cause,
			});
		}
	}
	// PERMISSIONS: Read Messages/View Channels + Read Message History
	const surveyMessage = await api.channels.getMessage(
		data.channel_id,
		// biome-ignore lint/style/noNonNullAssertion:
		data.data.custom_id.split("-")[1]! as Snowflake,
	);
	logger.debug(
		{ componentInteractionData: data },
		`editing the survey ${surveyMessage.channel_id}/${surveyMessage.id}`,
	);
	// biome-ignore lint/style/noNonNullAssertion:
	const members = await membersFromEmbed(db, surveyMessage.embeds[0]!, data.guild_id);
	await api.interactions.deferMessageUpdate(data.id, data.token);
	// PERMISSIONS: Embed Links
	await api.channels.editMessage(surveyMessage.channel_id, surveyMessage.id, {
		embeds: [embedFromMembers(members, { title, url, informations })],
	});
}
