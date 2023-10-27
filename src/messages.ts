import type { APIMessage } from "@discordjs/core";
import env from "./env";
import { Status } from "./utils/embed/status";
import { tagFromId } from "./utils/embed/tag";

export const messageUrl = (guildId: string, channelId: string, messageId: string): string =>
  `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;

export const channelUrl = (guildId: string, channelId: string): string =>
  `https://discord.com/channels/${guildId}/${channelId}`;
export const parseChannelUrl = (
  channelUrl: string,
): { guildId: string; channelId: string } | undefined =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  channelUrl.match(/^https:\/\/discord\.com\/channels\/(?<guildId>\d+)\/(?<channelId>\d+)$/)
    ?.groups as { guildId: string; channelId: string } | undefined;

export const createSurveyCommandMessages = {
  commandName: "sondage" as const,
  commandDescription: "Créer un sondage d'effectifs",
  nameOptionName: "nom" as const,
  nameOptionDescription: "Nom du sondage",
  threadOptionName: "thread" as const,
  threadOptionDescription: "Thread dans lequel ajouter automatiquement en cas de réponse positive",
  errors: {
    adminRoleDoesntExist: `Le rôle "${env.ADMIN_ROLE_NAME}", nécessaire pour créer un sondage, n'existe pas`,
    userIsNotAdmin: `Le rôle "${env.ADMIN_ROLE_NAME}" est nécessaire pour créer un sondage`,
  },
};

export const tagPendingCommandMessages = {
  commandName: "Rappel" as const,
  chooseTheChannel: "Choisir le channel dans lequel envoyer le rappel",
  errors: {
    onlyUsableOnSurveyMessage: "Cette commande n'est utilisable que sur un message de sondage",
    adminRoleDoesntExist: `Le rôle "${env.ADMIN_ROLE_NAME}", nécessaire pour faire un rappel, n'existe pas`,
    userIsNotAdmin: `Le rôle "${env.ADMIN_ROLE_NAME}" est nécessaire pour faire un rappel`,
    everybodyAnswered: "Tout le monde a répondu",
  },
};

export const tagPendingComponentInteractionMessages = {
  pleaseAnswer: (pending: Array<string>, guildId: string, surveyMessage: APIMessage): string =>
    `${pending.map(tagFromId).join(" ")}\n\nRépond${pending.length > 1 ? "ez" : "s"} s${
      pending.length > 1 ? "v" : "t"
    }p : ${messageUrl(guildId, surveyMessage.channel_id, surveyMessage.id)}`,
};

export const embedMessages = {
  defaultTitle: "Effectifs",
  // TODO: find a solution to create a blank field
  // \b works on macOS and iOS but displays a square on Windows
  // \u200B works on macOS and Windows but displays nothing on iOS
  // ```\u200B``` works on iOS but displays a dark rectangle on macOS and Winodws
  separator: "\\~\\~\\~\\~\\~\\~\\~\\~\\~\\~",
  didntAnswer: "Non répondu",
  missingGroups: `${Status.No} Pupitres manquants`,
  perhapsMissingGroups: `${Status.Perhaps} Pupitres peut-être manquants`,
  missingGroupsField: (
    groups: Array<{
      groupName: string;
      overlaps?: Array<{ userId: string; otherGroupName: string }>;
    }>,
  ): string =>
    groups
      .map(({ groupName, overlaps }) =>
        overlaps !== undefined
          ? `${groupName} (si ${overlaps
              .map(({ userId, otherGroupName }) => `${tagFromId(userId)} -> ${otherGroupName}`)
              .join(" et ")})`
          : groupName,
      )
      .join(", "),
};
