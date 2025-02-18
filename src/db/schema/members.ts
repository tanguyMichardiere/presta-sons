import { relations } from "drizzle-orm";
import { integer, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";
import { groupMembers } from "./groupMembers";
import { guilds } from "./guilds";
import { users } from "./users";

export const members = sqliteTable(
	"members",
	{
		id: integer("id").primaryKey(),
		userId: integer("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		guildId: integer("guild_id")
			.references(() => guilds.id, { onDelete: "cascade" })
			.notNull(),
		admin: integer("admin", { mode: "boolean" }).notNull(),
	},
	(table) => [uniqueIndex("members_idx").on(table.userId, table.guildId)],
);

export const membersRelations = relations(members, ({ one, many }) => ({
	user: one(users, { fields: [members.userId], references: [users.id] }),
	guild: one(guilds, { fields: [members.guildId], references: [guilds.id] }),
	groups: many(groupMembers),
}));
