import type { API, APIGuildMember, RESTGetAPIGuildMembersResult, Snowflake } from "@discordjs/core";
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

export type Groups = Array<{
	name: string;
	members: Array<{ snowflake: Snowflake; status?: Status }>;
}>;

// https://discord.com/developers/docs/resources/guild#list-guild-members
const maxLimit = 1000;

const getMembersPage = (
	api: API,
	guildSnowflake: Snowflake,
	previousPage?: RESTGetAPIGuildMembersResult,
): Promise<RESTGetAPIGuildMembersResult> =>
	// PERMISSIONS: Server Members Intent (Privileged Gateway Intents)
	api.guilds.getMembers(guildSnowflake, {
		limit: maxLimit,
		after:
			previousPage !== undefined
				? previousPage
						// biome-ignore lint/style/noNonNullAssertion: always included in guilds.getMembers
						.map(({ user }) => ({ snowflake: user!.id, bigIntSnowflake: BigInt(user!.id) }))
						.reduce((previousValue, currentValue) =>
							currentValue.bigIntSnowflake > previousValue.bigIntSnowflake
								? currentValue
								: previousValue,
						).snowflake
				: undefined,
	});

async function getAllMembers(api: API, guildSnowflake: Snowflake): Promise<APIGuildMember[]> {
	const pages = [await getMembersPage(api, guildSnowflake)];
	// biome-ignore lint/style/noNonNullAssertion: there is at least the first page
	while (pages.at(-1)!.length === maxLimit) {
		// biome-ignore lint/style/noNonNullAssertion: there is at least the first page
		pages.push(await getMembersPage(api, guildSnowflake, pages.at(-1)!));
	}
	return pages.flat();
}

export async function updateGroups(api: API, db: Db, guildSnowflake: Snowflake): Promise<void> {
	const childLogger = logger.child({ guildSnowflake });
	childLogger.debug("updating the members and roles list");
	const [allRoles, allMembers] = await Promise.all([
		api.guilds.getRoles(guildSnowflake),
		getAllMembers(api, guildSnowflake),
	]);
	childLogger.debug("retrieving the admin role(s)");
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
		.map(({ id, name }) => ({ snowflake: id, name: name.slice(env.ROLE_PREFIX.length) }));
	childLogger.setBindings({ groupRoles });
	const tooLongNames = groupRoles.filter(({ name }) => name.length > 256);
	if (tooLongNames.length > 0) {
		childLogger.warn({ tooLongNames }, "group names too long");
	}
	const groupRoleSnowflakes = groupRoles.map(({ snowflake }) => snowflake);
	const members = allMembers
		.filter((member) => member.roles.some((snowflake) => groupRoleSnowflakes.includes(snowflake)))
		// biome-ignore lint/style/noNonNullAssertion:
		.map(({ user, roles }) => ({ snowflake: user!.id, roles }));
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
			.values(members.map(({ snowflake }) => ({ snowflake })))
			.onConflictDoNothing()
			.then(() =>
				// INSERT ON CONFLICT DO NOTHING RETURNING doesn't return updated rows
				// so we have to select after the insert
				db.query.users.findMany({
					where: inArray(
						users.snowflake,
						members.map(({ snowflake }) => snowflake),
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
				members.map(({ snowflake, roles }) => ({
					// biome-ignore lint/style/noNonNullAssertion:
					userId: userIdBySnowflake[snowflake]!,
					guildId: insertedGuild.id,
					admin: roles.some((id) => adminRoleSnowflakes.includes(id)),
				})),
			)
			.returning({ id: membersTable.id, userId: membersTable.userId }),
		db
			.insert(groups)
			.values(
				groupRoles.map(({ snowflake, name }) => ({ snowflake, guildId: insertedGuild.id, name })),
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
		groupRoles.flatMap(({ snowflake: groupSnowflake }) =>
			members
				.filter(({ roles }) => roles.includes(groupSnowflake))
				.map(({ snowflake: userSnowflake }) => ({
					// biome-ignore lint/style/noNonNullAssertion:
					memberId: memberIdByUserId[userIdBySnowflake[userSnowflake]!]!,
					// biome-ignore lint/style/noNonNullAssertion:
					groupId: groupIdBySnowflake[groupSnowflake]!,
				})),
		),
	);
	childLogger.debug("successfully updated the members and roles list");
}

export async function getGroups(db: Db, guildSnowflake: Snowflake): Promise<Groups> {
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
		name,
		members: members.map(({ member }) => ({ snowflake: member.user.snowflake })),
	}));
}
