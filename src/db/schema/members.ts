import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { groupMembers } from "./groupMembers";
import { guilds } from "./guilds";

export const members = sqliteTable(
	"members",
	{
		id: integer("id").primaryKey(),
		discordId: text("discord_id").notNull(),
		guildId: integer("guild_id")
			.references(() => guilds.id, { onDelete: "cascade" })
			.notNull(),
		admin: integer("admin", { mode: "boolean" }).notNull(),
	},
	(table) => ({
		discordIdIdx: uniqueIndex("members_discord_id_idx").on(table.discordId),
	}),
);

export const membersRelations = relations(members, ({ one, many }) => ({
	guild: one(guilds, { fields: [members.guildId], references: [guilds.id] }),
	groups: many(groupMembers),
}));
