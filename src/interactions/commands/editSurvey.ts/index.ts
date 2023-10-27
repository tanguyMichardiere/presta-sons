import type { API } from "@discordjs/core";
import { ComponentType, MessageFlags, TextInputStyle } from "@discordjs/core";
import { editSurveyCommandMessages } from "../../../messages";
import { getAdminRole } from "../../../utils/adminRole";
import { informationsFromEmbed } from "../../../utils/embed";
import type { EditSurveyCommandData } from "./data";

export async function handleEditSurveyCommand(
  api: API,
  data: EditSurveyCommandData,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const surveyMessage = data.data.resolved.messages[data.data.target_id]!;
  if (surveyMessage.author.id !== data.application_id || surveyMessage.embeds.length !== 1) {
    await api.interactions.reply(data.id, data.token, {
      content: editSurveyCommandMessages.errors.onlyUsableOnSurveyMessage,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const adminRole = await getAdminRole(api, data.guild_id);
  if (adminRole === undefined) {
    await api.interactions.reply(data.id, data.token, {
      content: editSurveyCommandMessages.errors.adminRoleDoesntExist,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (!data.member.roles.some((roleId) => roleId === adminRole.id)) {
    await api.interactions.reply(data.id, data.token, {
      content: editSurveyCommandMessages.errors.userIsNotAdmin,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const embed = surveyMessage.embeds[0]!;
  const informations = informationsFromEmbed(embed);
  await api.interactions.createModal(data.id, data.token, {
    title: editSurveyCommandMessages.modal.title,
    custom_id: `editSurvey-${surveyMessage.id}`,
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.TextInput,
            label: editSurveyCommandMessages.modal.titleInputLabel,
            custom_id: "title",
            style: TextInputStyle.Paragraph,
            value: embed.title,
            max_length: 256,
            required: false,
          },
        ],
      },
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.TextInput,
            label: editSurveyCommandMessages.modal.urlInputLabel,
            custom_id: "url",
            style: TextInputStyle.Paragraph,
            value: embed.url,
            // length is 30 characters + 2 snowflakes
            // snowflakes are minimum 17 characters
            min_length: 64,
            // 72 characters allow for 21 characters snowflakes
            max_length: 72,
            required: false,
          },
        ],
      },
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.TextInput,
            label: editSurveyCommandMessages.modal.informationsInputLabel,
            custom_id: "informations",
            style: TextInputStyle.Paragraph,
            value: informations,
            max_length: 1024,
            required: false,
          },
        ],
      },
    ],
  });
}
