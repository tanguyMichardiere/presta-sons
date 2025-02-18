import { relations } from "drizzle-orm";
import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { groups } from "./groups";
import { members } from "./members";

export const groupMembers = sqliteTable(
	"group_members",
	{
		memberId: integer("member_id")
			.references(() => members.id, { onDelete: "cascade" })
			.notNull(),
		groupId: integer("group_id")
			.references(() => groups.id, { onDelete: "cascade" })
			.notNull(),
	},
	(table) => [primaryKey({ columns: [table.memberId, table.groupId] })],
);

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
	member: one(members, { fields: [groupMembers.memberId], references: [members.id] }),
	group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
}));
