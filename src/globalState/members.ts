import type { API, APIGuildMember, APIUser } from "@discordjs/core";
import env from "../env";
import { logger } from "../logger";
import type { Status } from "../utils/embed/status";

export type Members = Array<{
  groupName: string;
  groupMembers: Array<{ id: string; status?: Status }>;
}>;

export const membersState: Record<
  string,
  { adminRoleId: string | undefined; pendingMembers: Members }
> = {};

export async function updateMembers(api: API, guildId: string): Promise<void> {
  const childLogger = logger.child({ guildId });
  childLogger.debug("updating the members and roles list");
  const [allRoles, allMembers] = await Promise.all([
    api.guilds.getRoles(guildId),
    // PERMISSIONS: Server Members Intent (Privileged Gateway Intents)
    api.guilds.getMembers(guildId, { limit: 1000 }),
  ]);
  if (allMembers.length === 1000) {
    childLogger.warn("too many members");
  }
  childLogger.debug("retrieving the admin role");
  const adminRole = allRoles.find((role) => role.name === env.ADMIN_ROLE_NAME);
  if (adminRole !== undefined) {
    childLogger.debug({ adminRole }, "found the admin role");
  } else {
    childLogger.info("admin role not found");
  }
  const groupRoles = allRoles
    .filter(({ name }) => name.startsWith(env.ROLE_PREFIX))
    .sort((a, b) => b.position - a.position)
    .map(({ id, name }) => ({ id, groupName: name.slice(env.ROLE_PREFIX.length) }));
  childLogger.setBindings({ groupRoles });
  const tooLongNames = groupRoles.filter(({ groupName }) => groupName.length > 256);
  if (tooLongNames.length > 0) {
    childLogger.warn({ tooLongNames }, "group names too long");
  }
  const roleIds = groupRoles.map(({ id }) => id);
  const members = allMembers
    .filter(
      (member): member is APIGuildMember & { user: APIUser } =>
        member.user !== undefined && member.roles.some((id) => roleIds.includes(id)),
    )
    .map(({ user: { id }, roles }) => ({ id, roles }));
  childLogger.setBindings({ members });
  membersState[guildId] = {
    adminRoleId: adminRole?.id,
    pendingMembers: groupRoles.map(({ id: roleId, groupName }) => ({
      groupName,
      groupMembers: members.filter(({ roles }) => roles.includes(roleId)).map(({ id }) => ({ id })),
    })),
  };
  childLogger.debug("successfully updated the members and roles list");
}
