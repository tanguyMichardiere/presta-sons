import { groupMembers, groupMembersRelations } from "./groupMembers";
import { groups, groupsRelations } from "./groups";
import { guilds, guildsRelations } from "./guilds";
import { members, membersRelations } from "./members";
import { users, usersRelations } from "./users";

export const schema = {
	guilds,
	guildsRelations,
	users,
	usersRelations,
	members,
	membersRelations,
	groups,
	groupsRelations,
	groupMembers,
	groupMembersRelations,
};
