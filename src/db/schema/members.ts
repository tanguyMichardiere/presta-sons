import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { groups } from "./groups";

export const members = sqliteTable("members", {
	id: integer("id").primaryKey(),
	discordId: text("discord_id").notNull(),
	admin: integer("admin", { mode: "boolean" }).notNull(),

	groupId: integer("group_id")
		.references(() => groups.id, { onDelete: "cascade" })
		.notNull(),
});

export const membersRelations = relations(members, ({ one }) => ({
	group: one(groups),
}));
