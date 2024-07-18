import { relations } from "drizzle-orm";
import { integer, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";
import { groups } from "./groups";
import { members } from "./members";

export const groupMembers = sqliteTable(
	"group_members",
	{
		id: integer("id").primaryKey(),
		groupId: integer("group_id")
			.references(() => groups.id, { onDelete: "cascade" })
			.notNull(),
		memberId: integer("member_ids")
			.references(() => members.id, { onDelete: "cascade" })
			.notNull(),
	},
	(table) => ({
		idx: uniqueIndex("group_members_idx").on(table.groupId, table.memberId),
	}),
);

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
	group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
	member: one(members, { fields: [groupMembers.memberId], references: [members.id] }),
}));
