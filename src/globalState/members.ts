import type { API, APIGuildMember, APIUser } from "@discordjs/core";
import env from "../env";
import { logger } from "../logger";
import type { Status } from "../utils/embed/status";

export type Members = Array<{
  groupName: string;
  groupMembers: Array<{ id: string; status?: Status }>;
}>;

export const pendingMembers: Record<string, Members> = {};

export async function updateMembers(api: API, guildId: string): Promise<void> {
  const childLogger = logger.child({ guildId });
  childLogger.debug("updating the members and roles list");
  const [allRoles, allMembers] = await Promise.all([
    api.guilds.getRoles(guildId),
    api.guilds.getMembers(guildId, { limit: 1000 }),
  ]);
  if (allMembers.length === 1000) {
    childLogger.warn("too many members");
  }
  const groupRoles = allRoles
    .filter(({ name }) => name.startsWith(env.ROLE_PREFIX))
    .map(({ id, name }) => ({ id, groupName: name.slice(env.ROLE_PREFIX.length) }));
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
  pendingMembers[guildId] = groupRoles.map(({ id: roleId, groupName }) => ({
    groupName,
    groupMembers: members.filter(({ roles }) => roles.includes(roleId)).map(({ id }) => ({ id })),
  }));
  logger.debug("successfully updated the members and roles list");
}
