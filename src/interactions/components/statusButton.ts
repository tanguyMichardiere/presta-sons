import type { API, APIEmbed, APIThreadChannel, APIUser } from "@discordjs/core";
import { ComponentType } from "@discordjs/core";
import { z } from "zod";
import env from "../../env";
import { Snowflake } from "../../schemas";
import { embedFromMembers, membersFromEmbed } from "../../utils/embed";
import { updateMembers } from "../../utils/embed/members";
import { Status } from "../../utils/embed/status";

export const Data = z.object({
  id: Snowflake,
  token: z.string(),
  message: z.object({ channel_id: Snowflake, embeds: z.tuple([z.custom<APIEmbed>()]) }),
  member: z.object({ user: z.custom<APIUser>() }),
  data: z.object({
    component_type: z.literal(ComponentType.Button),
    custom_id: z.nativeEnum(Status),
  }),
});
type Data = z.infer<typeof Data>;

export async function handleStatusButtonComponentInteraction(api: API, data: Data): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const thread = (await api.channels.get(data.message.channel_id)) as APIThreadChannel;
  if (thread.parent_id === env.FORUM_ID) {
    const members = await membersFromEmbed(api, data.message.embeds[0]);
    const id = data.member.user.id;
    const status = data.data.custom_id;

    updateMembers(members, id, status);
    await api.interactions.updateMessage(data.id, data.token, {
      embeds: [embedFromMembers(members)],
    });
  }
}
