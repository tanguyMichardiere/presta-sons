import { MessageFlags, type API } from "@discordjs/core";
import { logger } from "../../../logger";
import { parseChannelUrl, surveyComponentInteractionMessages } from "../../../messages";
import { embedFromMembers, informationsFromEmbed, membersFromEmbed } from "../../../utils/embed";
import { Status } from "../../../utils/embed/status";
import { tagFromId } from "../../../utils/embed/tag";
import type { SurveyButtonComponentInteractionData } from "./data";

export async function handleSurveyComponentInteraction(
  api: API,
  data: SurveyButtonComponentInteractionData,
): Promise<void> {
  logger.debug(data, "updating survey results");
  const members = membersFromEmbed(data.message.embeds[0], data.guild_id);
  const id = data.member.user.id;
  const status = data.data.custom_id;

  for (const { groupMembers } of members) {
    for (const member of groupMembers) {
      if (member.id === id) {
        member.status = status;
      }
    }
  }

  if (status === Status.Ok && data.message.embeds[0].url !== undefined) {
    const threadId = parseChannelUrl(data.message.embeds[0].url)?.channelId;
    if (threadId !== undefined) {
      // PERMISSIONS: Send Messages in Threads
      // await api.threads.addMember(threadId, id);
      // alternative to avoid spamming with messages
      try {
        await api.threads.getMember(threadId, id);
      } catch {
        // PERMISSIONS: Send Messages in Threads
        const message = await api.channels.createMessage(threadId, {
          content: surveyComponentInteractionMessages.temporaryMessage,
          flags: MessageFlags.SuppressNotifications,
        });
        await api.channels.editMessage(threadId, message.id, { content: tagFromId(id) });
        await api.channels.deleteMessage(threadId, message.id);
      }
    } else {
      logger.warn(`invalid channel URL in embed: ${data.message.embeds[0].url}`);
    }
  }

  await api.interactions.updateMessage(data.id, data.token, {
    embeds: [
      embedFromMembers(members, {
        title: data.message.embeds[0].title,
        url: data.message.embeds[0].url,
        informations: informationsFromEmbed(data.message.embeds[0]),
      }),
    ],
  });
}
