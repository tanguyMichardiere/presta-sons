import type { APIEmbed, APIEmbedField, Snowflake } from "@discordjs/core";
import type { Db } from "../../db";
import type { Groups } from "../../global-state/members";
import { getMembers } from "../../global-state/members";
import { logger } from "../../logger";
import { embedMessages } from "../../messages";
import { buildGroupFields } from "./build-group-fields";
import { buildSummary } from "./build-summary";
import { extractStatus } from "./status/extract";
import { extractMissingGroups } from "./status/extract/groups/missing";
import { extractPerhapsMissingGroups } from "./status/extract/groups/perhaps-missing";
import { extractPendingMembers } from "./status/extract/pending-members";
import { tagFromSnowflake } from "./tag";

const separator: APIEmbedField = { name: "", value: embedMessages.separator };

export const informationsFromEmbed = (embed: APIEmbed): string | undefined =>
	embed.fields?.find(({ name, inline }) => name === embedMessages.informations && inline !== true)
		?.value;

export async function membersFromEmbed(
	db: Db,
	embed: APIEmbed,
	guildSnowflake: Snowflake,
): Promise<Groups> {
	const members = await getMembers(db, guildSnowflake);

	if (embed.fields === undefined) {
		logger.warn({ guildSnowflake, embed }, "embed has no fields");
		return members;
	}

	const statuses = extractStatus(embed.fields);
	for (const { name: groupName, members: groupMembers } of members) {
		for (const member of groupMembers) {
			member.status = statuses[groupName]?.[member.snowflake];
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
	members: Groups,
	{ title = embedMessages.defaultTitle, url, informations }: Partial<EmbedFromMembersOptions> = {},
): APIEmbed {
	const fields: APIEmbedField[] = [];

	if (informations !== undefined) {
		fields.push({ name: embedMessages.informations, value: informations }, separator);
	}

	let needsSeparator = false;

	const pending = extractPendingMembers(members);
	if (pending.length > 0) {
		fields.push({
			name: embedMessages.didntAnswer,
			value: pending.map(tagFromSnowflake).join(" "),
		});
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
