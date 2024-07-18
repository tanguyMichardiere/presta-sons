import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { groups } from "./groups";
import { members } from "./members";

export const guilds = sqliteTable(
	"guilds",
	{
		id: integer("id").primaryKey(),
		discordId: text("discord_id").notNull(),
	},
	(table) => ({
		discordIdIdx: uniqueIndex("guilds_discord_id_idx").on(table.discordId),
	}),
);

export const guildsRelations = relations(guilds, ({ many }) => ({
	groups: many(groups),
	members: many(members),
}));
