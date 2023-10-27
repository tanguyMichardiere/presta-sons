import type { API } from "@discordjs/core";
import { ChannelType, ComponentType, MessageFlags } from "@discordjs/core";
import { logger } from "../../../logger";
import { tagPendingCommandMessages } from "../../../messages";
import { getAdminRole } from "../../../utils/adminRole";
import { membersFromEmbed } from "../../../utils/embed";
import { extractPendingMembers } from "../../../utils/embed/status/extract/pendingMembers";
import type { TagPendingCommandData } from "./data";

export async function handleTagPendingCommand(
  api: API,
  data: TagPendingCommandData,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const surveyMessage = data.data.resolved.messages[data.data.target_id]!;
  if (surveyMessage.author.id !== data.application_id || surveyMessage.embeds.length !== 1) {
    await api.interactions.reply(data.id, data.token, {
      content: tagPendingCommandMessages.errors.onlyUsableOnSurveyMessage,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const adminRole = await getAdminRole(api, data.guild_id);
  if (adminRole === undefined) {
    await api.interactions.reply(data.id, data.token, {
      content: tagPendingCommandMessages.errors.adminRoleDoesntExist,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (!data.member.roles.some((roleId) => roleId === adminRole.id)) {
    await api.interactions.reply(data.id, data.token, {
      content: tagPendingCommandMessages.errors.userIsNotAdmin,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const members = membersFromEmbed(surveyMessage.embeds[0]!, data.guild_id);
  const pending = extractPendingMembers(members);
  if (pending.length === 0) {
    await api.interactions.reply(data.id, data.token, {
      content: tagPendingCommandMessages.errors.everybodyAnswered,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  logger.debug(data, "creating a tag prompt message with a channel select");
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
