import type { API, APIRole } from "@discordjs/core";
import env from "../env";
import { logger } from "../logger";

export async function getAdminRole(api: API, guildId: string): Promise<APIRole | undefined> {
  const childLogger = logger.child({ guildId });
  childLogger.debug("retrieving the admin role");
  const roles = await api.guilds.getRoles(guildId);
  const adminRole = roles.find((role) => role.name === env.ADMIN_ROLE_NAME);
  if (adminRole !== undefined) {
    childLogger.debug({ adminRole }, "found the admin role");
  } else {
    childLogger.info("admin role not found");
  }
  return adminRole;
}
