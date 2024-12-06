import type { Snowflake } from "@discordjs/core";
import { eq } from "drizzle-orm";
import type { Db } from "../../db";
import { guilds } from "../../db/schema/guilds";
import { members } from "../../db/schema/members";
import { users } from "../../db/schema/users";

export async function isAdmin(
	db: Db,
	guildSnowflake: Snowflake,
	userSnowflake: Snowflake,
): Promise<boolean> {
	const guild = await db.query.guilds.findFirst({
		columns: { id: true },
		where: eq(guilds.snowflake, guildSnowflake),
	});
	if (guild === undefined) {
		throw new Error("Guild not found");
	}
	const user = await db.query.users.findFirst({
		columns: {},
		where: eq(users.snowflake, userSnowflake),
		with: { members: { columns: { admin: true }, where: eq(members.guildId, guild.id) } },
	});
	if (user === undefined) {
		throw new Error("User not found");
	}
	const member = user.members[0];
	if (member === undefined) {
		throw new Error("User is not a member of this guild");
	}
	return member.admin;
}
