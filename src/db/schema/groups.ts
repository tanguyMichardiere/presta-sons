import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { groupMembers } from "./groupMembers";
import { guilds } from "./guilds";

export const groups = sqliteTable(
	"groups",
	{
		id: integer("id").primaryKey(),
		discordId: text("discord_id").notNull(),
		guildId: integer("guild_id")
			.references(() => guilds.id, { onDelete: "cascade" })
			.notNull(),
		name: text("name").notNull(),
	},
	(table) => ({
		discordIdIdx: uniqueIndex("groups_discord_id_idx").on(table.discordId),
	}),
);

export const groupsRelations = relations(groups, ({ one, many }) => ({
	guild: one(guilds, { fields: [groups.guildId], references: [guilds.id] }),
	members: many(groupMembers),
}));
