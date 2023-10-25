import type {
  API,
  APIEmbed,
  APIGuildMember,
  APITextChannel,
  APIThreadChannel,
  APIUser,
} from "@discordjs/core";
import { ComponentType } from "@discordjs/core";
import { z } from "zod";
import env from "../../env";
import { logger } from "../../logger";
import { Snowflake } from "../../schemas";
import { embedFromMembers, membersFromEmbed } from "../../utils/embed";
import { Status, extractPendingMembers } from "../../utils/embed/status";
import { tagFromId } from "../../utils/embed/tag";

export const Data = z.object({
  id: Snowflake,
  token: z.string(),
  guild_id: Snowflake,
  message: z.object({
    id: Snowflake,
    channel_id: Snowflake,
    embeds: z.tuple([z.custom<APIEmbed>()]),
  }),
  member: z
    .custom<APIGuildMember>()
    .refine((val): val is APIGuildMember & { user: APIUser } => val.user !== undefined),
  data: z.union([
    z.object({ component_type: z.literal(ComponentType.Button), custom_id: z.nativeEnum(Status) }),
    z
      .object({
        component_type: z.literal(ComponentType.ChannelSelect),
        custom_id: z.literal("tagPending"),
        values: z.tuple([Snowflake]),
        resolved: z.object({
          channels: z.record(Snowflake, z.custom<APITextChannel | APIThreadChannel>()),
        }),
      })
      .refine((val) => val.values[0] in val.resolved.channels),
  ]),
});
type Data = z.infer<typeof Data>;

export async function handleSurveyComponentInteraction(api: API, data: Data): Promise<void> {
  if (data.data.custom_id === "tagPending") {
    if (env.TAGGER_ROLE_ID === undefined || !data.member.roles.includes(env.TAGGER_ROLE_ID)) {
      throw new Error("Unauthorized to tag");
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const channel = data.data.resolved.channels[data.data.values[0]]!;
    logger.debug(data, `tagging all pending members in ${channel.id}`);
    const embed = data.message.embeds[0];
    const members = membersFromEmbed(embed, data.guild_id);
    const pending = extractPendingMembers(members);
    if (pending.length === 0) {
      await api.interactions.reply(data.id, data.token, { content: "Tout le monde a répondu" });
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
    logger.debug(data, "updating survey results");
    const members = membersFromEmbed(data.message.embeds[0], data.guild_id);
    const id = data.member.user.id;
    const status = data.data.custom_id;

    for (const [_, groupMembers] of members) {
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
}
