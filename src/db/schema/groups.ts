import type { Snowflake } from "@discordjs/core";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { groupMembers } from "./groupMembers";
import { guilds } from "./guilds";

export const groups = sqliteTable(
	"groups",
	{
		id: integer("id").primaryKey(),
		snowflake: text("snowflake").$type<Snowflake>().notNull(),
		guildId: integer("guild_id")
			.references(() => guilds.id, { onDelete: "cascade" })
			.notNull(),
		name: text("name").notNull(),
	},
	(table) => ({
		snowflakeIdx: uniqueIndex("groups_snowflake_idx").on(table.snowflake),
	}),
);

export const groupsRelations = relations(groups, ({ one, many }) => ({
	guild: one(guilds, { fields: [groups.guildId], references: [guilds.id] }),
	members: many(groupMembers),
}));
