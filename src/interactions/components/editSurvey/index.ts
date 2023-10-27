import type { API } from "@discordjs/core";
import { ChannelType, MessageFlags } from "@discordjs/core";
import { logger } from "../../../logger";
import { editSurveyComponentInteractionMessages, parseChannelUrl } from "../../../messages";
import { embedFromMembers, membersFromEmbed } from "../../../utils/embed";
import type { EditSurveyComponentInteractionData } from "./data";

const notEmptyOrUndefined = (string: string) => (string !== "" ? string : undefined);

export async function handleEditSurveyComponentInteraction(
  api: API,
  data: EditSurveyComponentInteractionData,
): Promise<void> {
  const title = notEmptyOrUndefined(data.data.components[0].components[0].value);
  const url = notEmptyOrUndefined(data.data.components[1].components[0].value);
  const informations = notEmptyOrUndefined(data.data.components[2].components[0].value);
  if (url !== undefined) {
    const match = parseChannelUrl(url);
    if (match === undefined) {
      await api.interactions.reply(data.id, data.token, {
        content: editSurveyComponentInteractionMessages.errors.invalidChannelUrl,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const thread = await api.channels.get(match.channelId);
    if (thread.type !== ChannelType.PublicThread) {
      await api.interactions.reply(data.id, data.token, {
        content: editSurveyComponentInteractionMessages.errors.notAThread,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }
  const surveyMessage = await api.channels.getMessage(
    data.channel_id,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    data.data.custom_id.split("-")[1]!,
  );
  logger.debug(data, `edit the survey ${surveyMessage.channel_id}/${surveyMessage.id}`);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const members = membersFromEmbed(surveyMessage.embeds[0]!, data.guild_id);
  await api.interactions.deferMessageUpdate(data.id, data.token);
  await api.channels.editMessage(surveyMessage.channel_id, surveyMessage.id, {
    embeds: [embedFromMembers(members, { title, url, informations })],
  });
}
