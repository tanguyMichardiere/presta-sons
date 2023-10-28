import type { API, APIActionRowComponent, APITextInputComponent } from "@discordjs/core";
import { ComponentType, TextInputStyle } from "@discordjs/core";
import { logger } from "../../../logger";
import { editSurveyCommandMessages } from "../../../messages";
import { getAdminRole } from "../../../utils/adminRole";
import { informationsFromEmbed } from "../../../utils/embed";
import { InteractionError } from "../../error";
import type { EditSurveyCommandData } from "./data";

const components = (
  title: string | undefined,
  url: string | undefined,
  informations: string | undefined,
): Array<APIActionRowComponent<APITextInputComponent>> => [
  {
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.TextInput,
        label: editSurveyCommandMessages.modal.titleInputLabel,
        custom_id: "title",
        style: TextInputStyle.Paragraph,
        value: title,
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
        value: url,
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
];

export async function handleEditSurveyCommand(
  api: API,
  data: EditSurveyCommandData,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const surveyMessage = data.data.resolved.messages[data.data.target_id]!;
  if (surveyMessage.author.id !== data.application_id || surveyMessage.embeds.length !== 1) {
    throw new InteractionError(editSurveyCommandMessages.errors.onlyUsableOnSurveyMessage);
  }
  const adminRole = await getAdminRole(api, data.guild_id);
  if (adminRole === undefined) {
    throw new InteractionError(editSurveyCommandMessages.errors.adminRoleDoesntExist);
  }
  if (!data.member.roles.some((roleId) => roleId === adminRole.id)) {
    throw new InteractionError(editSurveyCommandMessages.errors.userIsNotAdmin);
  }
  logger.debug(data, "creating a modal to edit a survey");
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const embed = surveyMessage.embeds[0]!;
  const informations = informationsFromEmbed(embed);
  await api.interactions.createModal(data.id, data.token, {
    title: editSurveyCommandMessages.modal.title,
    custom_id: `editSurvey-${surveyMessage.id}`,
    components: components(embed.title, embed.url, informations),
  });
}
