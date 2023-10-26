import type {
  API,
  APIInteractionDataResolved,
  APIInteractionDataResolvedChannel,
} from "@discordjs/core";
import { ComponentType } from "@discordjs/core";
import { z } from "zod";
import { logger } from "../../logger";
import { Snowflake } from "../../schemas";
import { membersFromEmbed } from "../../utils/embed";
import { extractPendingMembers } from "../../utils/embed/status/extract/pendingMembers";
import { tagFromId } from "../../utils/embed/tag";

export const Data = z.object({
  id: Snowflake,
  token: z.string(),
  channel_id: Snowflake,
  guild_id: Snowflake,
  data: z
    .object({
      component_type: z.literal(ComponentType.ChannelSelect),
      custom_id: z.custom<`tagPending-${string}`>(
        (val) => typeof val === "string" && val.startsWith("tagPending-"),
      ),
      values: z.tuple([Snowflake]),
      resolved: z
        .custom<APIInteractionDataResolved>((val) => val !== undefined)
        .refine(
          (
            val,
          ): val is APIInteractionDataResolved & {
            channels: Record<string, APIInteractionDataResolvedChannel>;
          } => val.channels !== undefined,
        ),
    })
    .refine((val) => val.values[0] in val.resolved.channels),
});
type Data = z.infer<typeof Data>;

export async function handleTagPendingComponentInteraction(api: API, data: Data): Promise<void> {
  const surveyMessage = await api.channels.getMessage(
    data.channel_id,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    data.data.custom_id.split("-")[1]!,
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const channel = data.data.resolved.channels[data.data.values[0]]!;
  logger.debug(
    data,
    `tagging all pending members for ${surveyMessage.channel_id}/${surveyMessage.id} in ${channel.id}`,
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const members = membersFromEmbed(surveyMessage.embeds[0]!, data.guild_id);
  const pending = extractPendingMembers(members);
  const tagMessage = await api.channels.createMessage(channel.id, {
    content: `${pending.map(tagFromId).join(" ")}\n\nRépond${pending.length > 1 ? "ez" : "s"} s${
      pending.length > 1 ? "v" : "t"
    }p : https://discord.com/channels/${data.guild_id}/${surveyMessage.channel_id}/${
      surveyMessage.id
    }`,
  });
  await api.interactions.updateMessage(data.id, data.token, {
    content: `https://discord.com/channels/${data.guild_id}/${channel.id}/${tagMessage.id}`,
    components: [],
  });
}
