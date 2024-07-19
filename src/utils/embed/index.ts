import type { APIEmbed, APIEmbedField } from "@discordjs/core";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { guilds } from "../../db/schema/guilds";
import type { Members } from "../../global-state/members";
import { membersState } from "../../global-state/members";
import { logger } from "../../logger";
import { embedMessages } from "../../messages";
import { buildGroupFields } from "./build-group-fields";
import { buildSummary } from "./build-summary";
import { extractStatus } from "./status/extract";
import { extractMissingGroups } from "./status/extract/groups/missing";
import { extractPerhapsMissingGroups } from "./status/extract/groups/perhaps-missing";
import { extractPendingMembers } from "./status/extract/pending-members";
import { tagFromId } from "./tag";

const separator: APIEmbedField = { name: "", value: embedMessages.separator };

export const informationsFromEmbed = (embed: APIEmbed): string | undefined =>
	embed.fields?.find(({ name, inline }) => name === embedMessages.informations && inline !== true)
		?.value;

export function membersFromEmbed(embed: APIEmbed, guildId: string): Members {
	// biome-ignore lint/style/noNonNullAssertion:
	const members = structuredClone(membersState[guildId]!.pendingMembers);
	try {
		const groupNamesFromState = members.map(({ groupName }) => groupName);
		groupNamesFromState.sort((a, b) => a.localeCompare(b));
		db.query.guilds
			.findFirst({
				where: eq(guilds.discordId, guildId),
				with: { groups: { with: { members: { with: { member: true } } } } },
			})
			.then((guild) => {
				if (guild === undefined) {
					throw new Error("guild not found");
				}
				const membersFromDb: Members = guild.groups.map(({ name, members }) => ({
					groupName: name,
					groupMembers: members.map(({ member }) => ({ id: member.discordId })),
				}));
				const groupNamesFromDb = membersFromDb.map(({ groupName }) => groupName);
				groupNamesFromDb.sort((a, b) => a.localeCompare(b));
				if (JSON.stringify(groupNamesFromDb) !== JSON.stringify(groupNamesFromState)) {
					logger.error({ groupNamesFromDb, groupNamesFromState });
					throw new Error("group names different");
				}
				for (const groupName of groupNamesFromDb) {
					// biome-ignore lint/style/noNonNullAssertion:
					const groupMembersFromDb = membersFromDb
						.find((members) => members.groupName === groupName)!
						.groupMembers.map(({ id }) => id);
					groupMembersFromDb.sort((a, b) => a.localeCompare(b));
					// biome-ignore lint/style/noNonNullAssertion:
					const groupMembersFromState = members
						.find((members) => members.groupName === groupName)!
						.groupMembers.map(({ id }) => id);
					groupMembersFromState.sort((a, b) => a.localeCompare(b));
					if (JSON.stringify(groupMembersFromDb) !== JSON.stringify(groupMembersFromState)) {
						logger.error({ groupName, groupMembersFromDb, groupMembersFromState });
						throw new Error("group members different");
					}
				}
				logger.warn("OK");
			});
	} catch (error) {
		logger.error(error);
	}

	if (embed.fields === undefined) {
		logger.warn({ guildId, embed }, "embed has no fields");
		return members;
	}

	const statuses = extractStatus(embed.fields);
	for (const { groupName, groupMembers } of members) {
		for (const member of groupMembers) {
			member.status = statuses[groupName]?.[member.id];
		}
	}

	return members;
}

type EmbedFromMembersOptions = {
	title: string;
	url: string;
	informations: string;
};

export function embedFromMembers(
	members: Members,
	{ title = embedMessages.defaultTitle, url, informations }: Partial<EmbedFromMembersOptions> = {},
): APIEmbed {
	const fields: APIEmbedField[] = [];

	if (informations !== undefined) {
		fields.push({ name: embedMessages.informations, value: informations }, separator);
	}

	let needsSeparator = false;

	const pending = extractPendingMembers(members);
	if (pending.length > 0) {
		fields.push({ name: embedMessages.didntAnswer, value: pending.map(tagFromId).join(" ") });
		needsSeparator = true;
	}

	const missing = extractMissingGroups(members);
	if (missing.length > 0) {
		fields.push({
			name: embedMessages.missingGroups,
			value: embedMessages.missingGroupsField(missing),
		});
		needsSeparator = true;
	}

	const perhapsMissing = extractPerhapsMissingGroups(members);
	if (perhapsMissing.length > 0) {
		fields.push({
			name: embedMessages.perhapsMissingGroups,
			value: embedMessages.missingGroupsField(perhapsMissing),
		});
		needsSeparator = true;
	}

	if (needsSeparator) {
		fields.push(separator);
	}

	fields.push(...buildGroupFields(members));

	const footer = buildSummary(members);

	return { title, fields, url, footer };
}
