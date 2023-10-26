import type { API } from "@discordjs/core";
import { ComponentType } from "@discordjs/core";
import { z } from "zod";
import type { Data as SurveyComponentInteractionData } from ".";
import { logger } from "../../../logger";
import { embedFromMembers, membersFromEmbed } from "../../../utils/embed";
import { Status } from "../../../utils/embed/status";

export const Data = z.object({
  component_type: z.literal(ComponentType.Button),
  custom_id: z.nativeEnum(Status),
});
export type Data = z.infer<typeof Data>;

export async function handleUpdateResultsComponentInteraction(
  api: API,
  data: SurveyComponentInteractionData,
  componentData: Data,
): Promise<void> {
  logger.debug(data, "updating survey results");
  const members = membersFromEmbed(data.message.embeds[0], data.guild_id);
  const id = data.member.user.id;
  const status = componentData.custom_id;

  for (const { groupMembers } of members) {
    for (const member of groupMembers) {
      if (member.id === id) {
        member.status = status;
      }
    }
  }

  await api.interactions.updateMessage(data.id, data.token, {
    embeds: [embedFromMembers(members)],
  });
}
