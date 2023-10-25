import type { API, APIGuildMember, APIUser } from "@discordjs/core";
import env from "../../env";
import type { Status } from "./status";

export type Members = Array<[string, Array<{ id: string; status?: Status }>]>;

export async function getMembersFromRoles(api: API): Promise<Members> {
  const [allRoles, allMembers] = await Promise.all([
    api.guilds.getRoles(env.GUILD_ID),
    api.guilds.getMembers(env.GUILD_ID),
  ]);
  const roles = allRoles
    .filter(({ name }) => name.startsWith(env.ROLE_PREFIX))
    .map(({ id, name }) => ({ id, groupName: name.slice(env.ROLE_PREFIX.length) }));
  const roleIds = roles.map(({ id }) => id);
  const members = allMembers
    .filter(
      (member): member is APIGuildMember & { user: APIUser } =>
        member.user !== undefined && member.roles.some((id) => roleIds.includes(id)),
    )
    .map(({ user: { id }, roles }) => ({ id, roles }));
  return roles.map(({ id: roleId, groupName }) => [
    groupName,
    members.filter(({ roles }) => roles.includes(roleId)).map(({ id }) => ({ id })),
  ]);
}

export function updateMembers(members: Members, id: string, status: Status): void {
  for (const [_, groupMembers] of members) {
    for (const member of groupMembers) {
      if (member.id === id) {
        member.status = status;
      }
    }
  }
}
