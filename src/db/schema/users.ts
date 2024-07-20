import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { members } from "./members";

export const users = sqliteTable(
	"users",
	{
		id: integer("id").primaryKey(),
		snowflake: text("snowflake").notNull(),
	},
	(table) => ({
		snowflakeIdx: uniqueIndex("users_snowflake_idx").on(table.snowflake),
	}),
);

export const usersRelations = relations(users, ({ many }) => ({
	members: many(members),
}));
