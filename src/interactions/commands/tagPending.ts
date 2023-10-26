import type {
  API,
  APIGuildMember,
  APIMessageApplicationCommandInteractionDataResolved,
  APIUser,
  RESTPutAPIApplicationGuildCommandsJSONBody,
} from "@discordjs/core";
import { ApplicationCommandType, ChannelType, ComponentType, MessageFlags } from "@discordjs/core";
import { z } from "zod";
import { logger } from "../../logger";
import { Snowflake } from "../../schemas";
import { membersFromEmbed } from "../../utils/embed";
import { extractPendingMembers } from "../../utils/embed/status/extract/pendingMembers";

export const command: RESTPutAPIApplicationGuildCommandsJSONBody[number] = {
  type: ApplicationCommandType.Message,
  name: "Rappel",
};

export const Data = z.object({
  id: Snowflake,
  token: z.string(),
  application_id: Snowflake,
  guild_id: Snowflake,
  member: z
    .custom<APIGuildMember>((val) => val !== undefined)
    .refine((val): val is APIGuildMember & { user: APIUser } => val.user !== undefined),
  data: z
    .object({
      type: z.literal(ApplicationCommandType.Message),
      name: z.literal("Rappel"),
      target_id: Snowflake,
      resolved: z.custom<APIMessageApplicationCommandInteractionDataResolved>(
        (val) => val !== undefined,
      ),
    })
    .refine((val) => val.target_id in val.resolved.messages),
});
type Data = z.infer<typeof Data>;

export async function handleTagPendingCommand(api: API, data: Data): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const surveyMessage = data.data.resolved.messages[data.data.target_id]!;
  if (surveyMessage.author.id !== data.application_id || surveyMessage.embeds.length !== 1) {
    await api.interactions.reply(data.id, data.token, {
      content: "Cette interaction n'est possible que sur un message de sondage",
      flags: MessageFlags.Ephemeral,
    });
  } else if (surveyMessage.interaction?.user.id !== data.member.user.id) {
    await api.interactions.reply(data.id, data.token, {
      content: "Cette interaction n'est possible que sur un message de sondage que vous avez créé",
      flags: MessageFlags.Ephemeral,
    });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const members = membersFromEmbed(surveyMessage.embeds[0]!, data.guild_id);
    const pending = extractPendingMembers(members);
    if (pending.length === 0) {
      await api.interactions.reply(data.id, data.token, {
        content: "Tout le monde a répondu",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      logger.debug(data, "creating a tag prompt");
      await api.interactions.reply(data.id, data.token, {
        content: "Choisir le channel dans lequel envoyer le rappel",
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
  }
}
