import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import { updateMembers } from "../../globalState/members";

export const handleGuildMemberRemove = createEventHandler(
  GatewayDispatchEvents.GuildMemberRemove,
  async function ({ data, api }) {
    await updateMembers(api, data.guild_id);
  },
);
