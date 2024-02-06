import type { API } from "@discordjs/core";
import { ChannelType } from "@discordjs/core";
import { logger } from "../../../logger";
import { editSurveyComponentInteractionMessages, parseChannelUrl } from "../../../messages";
import { embedFromMembers, membersFromEmbed } from "../../../utils/embed";
import { InteractionError } from "../../error";
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
      throw new InteractionError(editSurveyComponentInteractionMessages.errors.invalidChannelUrl);
    }
    try {
      const thread = await api.channels.get(match.channelId);
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    data.data.custom_id.split("-")[1]!,
  );
  logger.debug(data, `editing the survey ${surveyMessage.channel_id}/${surveyMessage.id}`);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const members = membersFromEmbed(surveyMessage.embeds[0]!, data.guild_id);
  await api.interactions.deferMessageUpdate(data.id, data.token);
  // PERMISSIONS: Embed Links
  await api.channels.editMessage(surveyMessage.channel_id, surveyMessage.id, {
    embeds: [embedFromMembers(members, { title, url, informations })],
  });
}
