import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { members } from "./members";

export const groups = sqliteTable("groups", {
	id: integer("id").primaryKey(),
	discordId: text("discord_id").notNull(),
	guildId: text("guild_id").notNull(),
	name: text("name").notNull(),
});

export const groupsRelations = relations(groups, ({ many }) => ({
	members: many(members),
}));
