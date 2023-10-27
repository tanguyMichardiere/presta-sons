import type { API, APIRole } from "@discordjs/core";
import env from "../env";

export async function getAdminRole(api: API, guildId: string): Promise<APIRole | undefined> {
  const roles = await api.guilds.getRoles(guildId);
  return roles.find((role) => role.name === env.ADMIN_ROLE_NAME);
}
