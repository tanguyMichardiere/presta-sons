import type { API, APIGuildMember, APIUser, RESTGetAPIGuildMembersResult } from "@discordjs/core";
import { eq, inArray } from "drizzle-orm";
import type { Db } from "../db";
import { groupMembers } from "../db/schema/groupMembers";
import { groups } from "../db/schema/groups";
import { guilds } from "../db/schema/guilds";
import { members as membersTable } from "../db/schema/members";
import { users } from "../db/schema/users";
import { env } from "../env";
import { logger } from "../logger";
import type { Status } from "../utils/embed/status";

export type Members = Array<{
	groupName: string;
	groupMembers: Array<{ id: string; status?: Status }>;
}>;

// https://discord.com/developers/docs/resources/guild#list-guild-members
const maxLimit = 1000;

const getMembersPage = (
	api: API,
	guildSnowflake: string,
	previousPage?: RESTGetAPIGuildMembersResult,
) =>
	// PERMISSIONS: Server Members Intent (Privileged Gateway Intents)
	api.guilds.getMembers(guildSnowflake, {
		limit: maxLimit,
		after:
			previousPage !== undefined
				? String(
						previousPage
							// biome-ignore lint/style/noNonNullAssertion: always included in guilds.getMembers
							.map(({ user }) => ({ snowflake: user!.id, bigIntSnowflake: BigInt(user!.id) }))
							.reduce((previousValue, currentValue) =>
								currentValue.bigIntSnowflake > previousValue.bigIntSnowflake
									? currentValue
									: previousValue,
							),
					)
				: undefined,
	});

async function getAllMembers(api: API, guildSnowflake: string): Promise<APIGuildMember[]> {
	const pages = [await getMembersPage(api, guildSnowflake)];
	// biome-ignore lint/style/noNonNullAssertion: there is at least the first page
	while (pages.at(-1)!.length === maxLimit) {
		// biome-ignore lint/style/noNonNullAssertion: there is at least the first page
		pages.push(await getMembersPage(api, guildSnowflake, pages.at(-1)!));
	}
	return pages.flat();
}

export async function updateMembers(api: API, db: Db, guildSnowflake: string): Promise<void> {
	const childLogger = logger.child({ guildSnowflake });
	childLogger.debug("updating the members and roles list");
	const [allRoles, allMembers] = await Promise.all([
		api.guilds.getRoles(guildSnowflake),
		getAllMembers(api, guildSnowflake),
	]);
	childLogger.debug("retrieving the admin role");
	const adminRoles = allRoles.filter((role) => role.name === env.ADMIN_ROLE_NAME);
	if (adminRoles.length > 0) {
		childLogger.debug({ adminRoles }, "found the admin role");
	} else {
		childLogger.info("admin role not found");
	}
	const adminRoleSnowflakes = adminRoles.map(({ id }) => id);
	const groupRoles = allRoles
		.filter(({ name }) => name.startsWith(env.ROLE_PREFIX))
		.sort((a, b) => b.position - a.position)
		.map(({ id, name }) => ({ id, groupName: name.slice(env.ROLE_PREFIX.length) }));
	childLogger.setBindings({ groupRoles });
	const tooLongNames = groupRoles.filter(({ groupName }) => groupName.length > 256);
	if (tooLongNames.length > 0) {
		childLogger.warn({ tooLongNames }, "group names too long");
	}
	const groupRoleSnowflakes = groupRoles.map(({ id }) => id);
	const members = allMembers
		.filter(
			(member): member is APIGuildMember & { user: APIUser } =>
				member.user !== undefined && member.roles.some((id) => groupRoleSnowflakes.includes(id)),
		)
		.map(({ user: { id }, roles }) => ({ id, roles }));
	childLogger.setBindings({ members });
	await db.delete(guilds).where(eq(guilds.snowflake, guildSnowflake));
	const [insertedGuild, insertedUsers] = await Promise.all([
		db
			.insert(guilds)
			.values({ snowflake: guildSnowflake })
			.returning({ id: guilds.id })
			// biome-ignore lint/style/noNonNullAssertion:
			.then((guilds) => guilds[0]!),
		db
			.insert(users)
			.values(members.map(({ id }) => ({ snowflake: id })))
			.onConflictDoNothing()
			.then(() =>
				// INSERT ON CONFLICT DO NOTHING RETURNING doesn't return updated rows
				// so we have to select after the insert
				db.query.users.findMany({
					where: inArray(
						users.snowflake,
						members.map(({ id }) => id),
					),
				}),
			),
	]);
	const userIdBySnowflake = Object.fromEntries(
		insertedUsers.map(({ id, snowflake }) => [snowflake, id]),
	);
	const [insertedMembers, insertedGroups] = await Promise.all([
		db
			.insert(membersTable)
			.values(
				members.map(({ id, roles }) => ({
					// biome-ignore lint/style/noNonNullAssertion:
					userId: userIdBySnowflake[id]!,
					guildId: insertedGuild.id,
					admin: roles.some((id) => adminRoleSnowflakes.includes(id)),
				})),
			)
			.returning({ id: membersTable.id, userId: membersTable.userId }),
		db
			.insert(groups)
			.values(
				groupRoles.map(({ id, groupName }) => ({
					snowflake: id,
					guildId: insertedGuild.id,
					name: groupName,
				})),
			)
			.returning({ id: groups.id, snowflake: groups.snowflake }),
	]);
	const memberIdByUserId = Object.fromEntries(
		insertedMembers.map(({ id, userId }) => [userId, id]),
	);
	const groupIdBySnowflake = Object.fromEntries(
		insertedGroups.map(({ id, snowflake }) => [snowflake, id]),
	);
	await db.insert(groupMembers).values(
		groupRoles.flatMap(({ id: groupSnowflake }) =>
			members
				.filter(({ roles }) => roles.includes(groupSnowflake))
				.map(({ id: userSnowflake }) => ({
					// biome-ignore lint/style/noNonNullAssertion:
					memberId: memberIdByUserId[userIdBySnowflake[userSnowflake]!]!,
					// biome-ignore lint/style/noNonNullAssertion:
					groupId: groupIdBySnowflake[groupSnowflake]!,
				})),
		),
	);
	childLogger.debug("successfully updated the members and roles list");
}

export async function getMembers(db: Db, guildSnowflake: string): Promise<Members> {
	const guild = await db.query.guilds.findFirst({
		columns: {},
		where: eq(guilds.snowflake, guildSnowflake),
		with: {
			groups: {
				columns: { name: true },
				with: {
					members: {
						columns: {},
						with: { member: { columns: {}, with: { user: { columns: { snowflake: true } } } } },
					},
				},
			},
		},
	});
	if (guild === undefined) {
		throw new Error("guild not found");
	}
	return guild.groups.map(({ name, members }) => ({
		groupName: name,
		groupMembers: members.map(({ member }) => ({ id: member.user.snowflake })),
	}));
}
