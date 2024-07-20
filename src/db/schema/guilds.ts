import type { Snowflake } from "@discordjs/core";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { groups } from "./groups";
import { members } from "./members";

export const guilds = sqliteTable(
	"guilds",
	{
		id: integer("id").primaryKey(),
		snowflake: text("snowflake").$type<Snowflake>().notNull(),
	},
	(table) => ({
		snowflakeIdx: uniqueIndex("guilds_snowflake_idx").on(table.snowflake),
	}),
);

export const guildsRelations = relations(guilds, ({ many }) => ({
	groups: many(groups),
	members: many(members),
}));
