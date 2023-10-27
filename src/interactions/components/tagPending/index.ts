import type { API } from "@discordjs/core";
import { logger } from "../../../logger";
import { messageUrl, tagPendingComponentInteractionMessages } from "../../../messages";
import { membersFromEmbed } from "../../../utils/embed";
import { extractPendingMembers } from "../../../utils/embed/status/extract/pendingMembers";
import type { TagPendingComponentInteractionData } from "./data";

export async function handleTagPendingComponentInteraction(
  api: API,
  data: TagPendingComponentInteractionData,
): Promise<void> {
  const surveyMessage = await api.channels.getMessage(
    data.channel_id,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    data.data.custom_id.split("-")[1]!,
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const channel = data.data.resolved.channels[data.data.values[0]]!;
  logger.debug(
    data,
    `tagging all pending members for ${surveyMessage.channel_id}/${surveyMessage.id} in ${channel.id}`,
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const members = membersFromEmbed(surveyMessage.embeds[0]!, data.guild_id);
  const pending = extractPendingMembers(members);
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
