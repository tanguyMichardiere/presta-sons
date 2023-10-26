import {
  ComponentType,
  type API,
  type APIEmbed,
  type APIGuildMember,
  type APIMessage,
  type APIMessageInteraction,
  type APIUser,
} from "@discordjs/core";
import { z } from "zod";
import { logger } from "../../logger";
import { Snowflake } from "../../schemas";
import { embedFromMembers, membersFromEmbed } from "../../utils/embed";
import { Status } from "../../utils/embed/status";

export const Data = z.object({
  id: Snowflake,
  token: z.string(),
  channel_id: Snowflake,
  guild_id: Snowflake,
  message: z
    .custom<APIMessage>((val) => val !== undefined)
    .refine(
      (val): val is APIMessage & { interaction: APIMessageInteraction; embeds: [APIEmbed] } =>
        val.interaction !== undefined && val.embeds.length === 1,
    ),
  member: z
    .custom<APIGuildMember>((val) => val !== undefined)
    .refine((val): val is APIGuildMember & { user: APIUser } => val.user !== undefined),
  data: z.object({
    component_type: z.literal(ComponentType.Button),
    custom_id: z.nativeEnum(Status),
  }),
});
export type Data = z.infer<typeof Data>;

export async function handleSurveyComponentInteraction(api: API, data: Data): Promise<void> {
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

  await api.interactions.updateMessage(data.id, data.token, {
    embeds: [embedFromMembers(members)],
  });
}
