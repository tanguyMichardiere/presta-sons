import type { API, APIActionRowComponent, APIMessageActionRowComponent } from "@discordjs/core";
import { ButtonStyle, ComponentType } from "@discordjs/core";
import { pendingMembers } from "../../../globalState/members";
import { logger } from "../../../logger";
import { channelUrl, createSurveyCommandMessages } from "../../../messages";
import { getAdminRole } from "../../../utils/adminRole";
import { embedFromMembers } from "../../../utils/embed";
import { Status } from "../../../utils/embed/status";
import { InteractionError } from "../../error";
import type { CreateSurveyCommandData } from "./data";

const components: Array<APIActionRowComponent<APIMessageActionRowComponent>> = [
  {
    type: ComponentType.ActionRow,
    components: [Status.Ok, Status.Perhaps, Status.No].map((status) => ({
      type: ComponentType.Button,
      style: ButtonStyle.Secondary,
      emoji: { name: status },
      custom_id: status,
    })),
  },
];

export async function handleCreateSurveyCommand(
  api: API,
  data: CreateSurveyCommandData,
): Promise<void> {
  const adminRole = await getAdminRole(api, data.guild_id);
  if (adminRole === undefined) {
    throw new InteractionError(createSurveyCommandMessages.errors.adminRoleDoesntExist);
  }
  if (!data.member.roles.some((roleId) => roleId === adminRole.id)) {
    throw new InteractionError(createSurveyCommandMessages.errors.userIsNotAdmin);
  }
  logger.debug(data, "creating a survey");
  const embedTitle = data.data.options?.find(
    (option) => option.name === createSurveyCommandMessages.nameOptionName,
  )?.value;
  const threadId = data.data.options?.find(
    (option) => option.name === createSurveyCommandMessages.threadOptionName,
  )?.value;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const thread = threadId !== undefined ? data.data.resolved!.channels[threadId] : undefined;
  const threadUrl = thread !== undefined ? channelUrl(data.guild_id, thread.id) : undefined;
  await api.interactions.reply(data.id, data.token, {
    embeds: [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      embedFromMembers(pendingMembers[data.guild_id]!, { title: embedTitle, url: threadUrl }),
    ],
    components,
  });
}
