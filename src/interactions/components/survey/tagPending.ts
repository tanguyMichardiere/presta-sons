import type {
  API,
  APIInteractionDataResolved,
  APIInteractionDataResolvedChannel,
} from "@discordjs/core";
import { ComponentType, MessageFlags } from "@discordjs/core";
import { z } from "zod";
import type { Data as SurveyComponentInteractionData } from ".";
import { logger } from "../../../logger";
import { Snowflake } from "../../../schemas";
import { membersFromEmbed } from "../../../utils/embed";
import { extractPendingMembers } from "../../../utils/embed/status/extract/pendingMembers";
import { tagFromId } from "../../../utils/embed/tag";

export const Data = z
  .object({
    component_type: z.literal(ComponentType.ChannelSelect),
    custom_id: z.literal("tagPending"),
    values: z.tuple([Snowflake]),
    resolved: z.custom<APIInteractionDataResolved>().refine(
      (
        val,
      ): val is APIInteractionDataResolved & {
        channels: Record<string, APIInteractionDataResolvedChannel>;
      } => val.channels !== undefined,
    ),
  })
  .refine((val) => val.values[0] in val.resolved.channels);
type Data = z.infer<typeof Data>;

export async function handleTagPendingComponentInteraction(
  api: API,
  data: SurveyComponentInteractionData,
  componentData: Data,
): Promise<void> {
  if (data.message.interaction.user.id === data.member.user.id) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const channel = componentData.resolved.channels[componentData.values[0]]!;
    logger.debug(data, `tagging all pending members in ${channel.id}`);
    const members = membersFromEmbed(data.message.embeds[0], data.guild_id);
    const pending = extractPendingMembers(members);
    if (pending.length === 0) {
      await api.interactions.reply(data.id, data.token, {
        content: "Tout le monde a répondu",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await api.interactions.deferMessageUpdate(data.id, data.token);
      await api.channels.createMessage(channel.id, {
        content: `${pending.map(tagFromId).join(" ")}\n\nRépond${
          pending.length > 1 ? "ez" : "s"
        } s${pending.length > 1 ? "v" : "t"}p : https://discord.com/channels/${data.guild_id}/${
          data.message.channel_id
        }/${data.message.id}`,
      });
    }
  } else {
    await api.interactions.reply(data.id, data.token, {
      content: "Vous ne pouvez pas faire ça avec un sondage que vous n'avez pas créé",
      flags: MessageFlags.Ephemeral,
    });
  }
}
