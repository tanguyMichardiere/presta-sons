import type {
  API,
  APIThreadChannel,
  RESTPutAPIApplicationGuildCommandsJSONBody,
} from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType } from "@discordjs/core";
import { z } from "zod";
import env from "../../env";
import { Snowflake } from "../../schemas";
import { membersFromEmbed } from "../../utils/embed";
import { extractPendingMembers } from "../../utils/embed/status";
import { tagFromId } from "../../utils/embed/tag";
import { findEarliestMessage } from "../../utils/findEarliestMessage";

export const command: RESTPutAPIApplicationGuildCommandsJSONBody[number] = {
  type: ApplicationCommandType.ChatInput,
  name: "rappel",
  description: "Mentionner les fanfarons qui n'ont pas encore répondu à un sondage d'évènement",
  options: [
    {
      name: "thread",
      description: "Thread de l'évènement",
      type: ApplicationCommandOptionType.Channel,
      channel_types: [ChannelType.PublicThread],
      required: true,
    },
  ],
};

export const Data = z.object({
  id: Snowflake,
  token: z.string(),
  data: z
    .object({
      type: z.literal(ApplicationCommandType.ChatInput),
      name: z.literal("rappel"),
      options: z.tuple([
        z.object({
          name: z.literal("thread"),
          type: z.literal(ApplicationCommandOptionType.Channel),
          value: Snowflake,
        }),
      ]),
      resolved: z.object({ channels: z.record(Snowflake, z.custom<APIThreadChannel>()) }),
    })
    .refine(({ options, resolved }) => options[0].value in resolved.channels),
});
type Data = z.infer<typeof Data>;

export async function handleMentionPendingCommand(api: API, data: Data): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const thread = data.data.resolved.channels[data.data.options[0].value]!;
  if (thread.parent_id === env.FORUM_ID) {
    const message = await findEarliestMessage(api, thread.id);
    const embed = message.embeds[0];
    if (embed === undefined) {
      throw new Error("Embed not found");
    }
    const members = await membersFromEmbed(api, embed);
    const pending = extractPendingMembers(members);
    await api.interactions.reply(data.id, data.token, {
      content:
        pending.length > 0
          ? `${pending.map(tagFromId).join(" ")}\n\nRépondez svp : <#${thread.id}>`
          : "Tout le monde a répondu",
    });
  }
}
