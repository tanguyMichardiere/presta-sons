import type { API } from "@discordjs/core";
import { ChannelType, ComponentType, MessageFlags } from "@discordjs/core";
import { membersState } from "../../../globalState/members";
import { logger } from "../../../logger";
import { tagPendingCommandMessages } from "../../../messages";
import { membersFromEmbed } from "../../../utils/embed";
import { extractPendingMembers } from "../../../utils/embed/status/extract/pendingMembers";
import { InteractionError } from "../../error";
import type { TagPendingCommandData } from "./data";

export async function handleTagPendingCommand(
  api: API,
  data: TagPendingCommandData,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const surveyMessage = data.data.resolved.messages[data.data.target_id]!;
  if (surveyMessage.author.id !== data.application_id || surveyMessage.embeds.length !== 1) {
    throw new InteractionError(tagPendingCommandMessages.errors.onlyUsableOnSurveyMessage);
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const adminRoleId = membersState[data.guild_id]!.adminRoleId;
  if (adminRoleId === undefined) {
    throw new InteractionError(tagPendingCommandMessages.errors.adminRoleDoesntExist);
  }
  if (!data.member.roles.some((roleId) => roleId === adminRoleId)) {
    throw new InteractionError(tagPendingCommandMessages.errors.userIsNotAdmin);
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const members = membersFromEmbed(surveyMessage.embeds[0]!, data.guild_id);
  const pending = extractPendingMembers(members);
  if (pending.length === 0) {
    throw new InteractionError(tagPendingCommandMessages.errors.everybodyAnswered);
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
