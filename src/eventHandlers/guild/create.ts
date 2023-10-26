import { GatewayDispatchEvents } from "@discordjs/core";
import { createEventHandler } from "..";
import { updateMembers } from "../../globalState/members";

export const handleGuildCreate = createEventHandler(
  GatewayDispatchEvents.GuildCreate,
  async function ({ data, api }) {
    await updateMembers(api, data.id);
  },
);
