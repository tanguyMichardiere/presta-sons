import type { APIMessage, Snowflake } from "@discordjs/core";
import { env } from "./env";
import { snowflakeRegex } from "./schemas";
import { Status } from "./utils/embed/status";
import { tagFromSnowflake } from "./utils/embed/tag";

export const messageUrl = (
	guildSnowflake: Snowflake,
	channelSnowflake: Snowflake,
	messageSnowflake: Snowflake,
): string =>
	`https://discord.com/channels/${guildSnowflake}/${channelSnowflake}/${messageSnowflake}`;

export const channelUrl = (guildSnowflake: Snowflake, channelSnowflake: Snowflake): string =>
	`https://discord.com/channels/${guildSnowflake}/${channelSnowflake}`;
const channelUrlRegex = new RegExp(
	`^https:\\/\\/discord\\.com\\/channels\\/(?<guildSnowflake>${snowflakeRegex.source})\\/(?<channelSnowflake>${snowflakeRegex.source})$`,
);
export const parseChannelUrl = (
	channelUrl: string,
): { guildSnowflake: Snowflake; channelSnowflake: Snowflake } | undefined =>
	channelUrl.match(channelUrlRegex)?.groups as
		| { guildSnowflake: Snowflake; channelSnowflake: Snowflake }
		| undefined;

export const createSurveyCommandMessages = {
	commandName: "sondage" as const,
	commandDescription: "Créer un sondage d'effectifs",
	nameOptionName: "nom" as const,
	nameOptionDescription: "Nom du sondage",
	threadOptionName: "thread" as const,
	threadOptionDescription: "Thread dans lequel ajouter automatiquement en cas de réponse positive",
	errors: {
		userIsNotAdmin: `Le rôle "${env.ADMIN_ROLE_NAME}" est nécessaire pour créer un sondage`,
	},
};

export const editSurveyCommandMessages = {
	commandName: "Modifier Sondage" as const,
	modal: {
		title: "Modifier le sondage",
		titleInputLabel: "Nom",
		urlInputLabel: "URL du thread",
		informationsInputLabel: "Informations",
	},
	errors: {
		onlyUsableOnSurveyMessage: "Cette commande n'est utilisable que sur un message de sondage",
		userIsNotAdmin: `Le rôle "${env.ADMIN_ROLE_NAME}" est nécessaire pour modifier les informations d'un sondage`,
	},
};

export const editSurveyComponentInteractionMessages = {
	errors: {
		invalidChannelUrl: "L'URL de thread n'est pas une URL de channel valide",
		notAThread: "L'URL n'est pas celle d'un thread",
		channelNotFound: "L'URL ne correspond à aucun channel",
	},
};

export const tagPendingCommandMessages = {
	commandName: "Rappel Sondage" as const,
	chooseTheChannel: "Choisir le channel dans lequel envoyer le rappel",
	errors: {
		onlyUsableOnSurveyMessage: "Cette commande n'est utilisable que sur un message de sondage",
		userIsNotAdmin: `Le rôle "${env.ADMIN_ROLE_NAME}" est nécessaire pour faire un rappel de sondage`,
		everybodyAnswered: "Tout le monde a répondu",
	},
};

export const tagPendingComponentInteractionMessages = {
	pleaseAnswer: (
		pending: Snowflake[],
		guildSnowflake: Snowflake,
		surveyMessage: APIMessage,
	): string =>
		`${pending.map(tagFromSnowflake).join(" ")}\n\nRépond${pending.length > 1 ? "ez" : "s"} s${
			pending.length > 1 ? "v" : "t"
		}p : ${messageUrl(guildSnowflake, surveyMessage.channel_id, surveyMessage.id)}`,
};

export const embedMessages = {
	defaultTitle: "Effectifs",
	informations: "Informations",
	// TODO: find a solution to create a blank field
	// \b works on macOS and iOS but displays a square on Windows
	// \u200B works on macOS and Windows but displays nothing on iOS
	// ```\u200B``` works on iOS but displays a dark rectangle on macOS and Winodws
	separator: "\\~\\~\\~\\~\\~\\~\\~\\~\\~\\~",
	didntAnswer: "Non répondu",
	missingGroups: `${Status.No} Pupitres manquants`,
	perhapsMissingGroups: `${Status.Perhaps} Pupitres peut-être manquants`,
	missingGroupsField: (
		groups: {
			groupName: string;
			overlaps: { userSnowflake: Snowflake; otherGroupName: string }[];
		}[],
	): string =>
		groups
			.map(({ groupName, overlaps }) =>
				overlaps.length > 0
					? `${groupName} (si ${overlaps
							.map(
								({ userSnowflake, otherGroupName }) =>
									`${tagFromSnowflake(userSnowflake)} -> ${otherGroupName}`,
							)
							.join(" et ")})`
					: groupName,
			)
			.join(", "),
};

export const surveyComponentInteractionMessages = {
	temporaryMessage: "😶‍🌫️",
};
