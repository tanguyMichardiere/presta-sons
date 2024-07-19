import { groupMembers, groupMembersRelations } from "./groupMembers";
import { groups, groupsRelations } from "./groups";
import { guilds, guildsRelations } from "./guilds";
import { members, membersRelations } from "./members";

export const schema = {
	guilds,
	guildsRelations,
	groups,
	groupsRelations,
	members,
	membersRelations,
	groupMembers,
	groupMembersRelations,
};
