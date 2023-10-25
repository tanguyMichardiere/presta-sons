import type { API, APIEmbed, APIGuildMember, APIUser } from "@discordjs/core";
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
  message: z.object({ embeds: z.tuple([z.custom<APIEmbed>()]) }),
  member: z
    .custom<APIGuildMember>()
    .refine((val): val is APIGuildMember & { user: APIUser } => val.user !== undefined),
  data: z.object({
    component_type: z.literal(ComponentType.Button),
    custom_id: z.union([z.nativeEnum(Status), z.literal("tagPending")]),
  }),
});
type Data = z.infer<typeof Data>;

export async function handleSurveyButtonComponentInteraction(api: API, data: Data): Promise<void> {
  if (data.data.custom_id === "tagPending") {
    logger.debug(data, "tagging all pending members");
    if (env.TAGGER_ROLE_ID === undefined || !data.member.roles.includes(env.TAGGER_ROLE_ID)) {
      throw new Error("Unauthorized to tag");
    }
    const embed = data.message.embeds[0];
    const members = membersFromEmbed(embed, data.guild_id);
    const pending = extractPendingMembers(members);
    await api.interactions.reply(data.id, data.token, {
      content:
        pending.length > 0
          ? `${pending.map(tagFromId).join(" ")}\n\nRépond${pending.length > 1 ? "ez" : "s"} s${
              pending.length > 1 ? "v" : "t"
            }p`
          : "Tout le monde a répondu",
    });
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
