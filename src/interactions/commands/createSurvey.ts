import type {
  API,
  APIActionRowComponent,
  APIMessageActionRowComponent,
  RESTPutAPIApplicationGuildCommandsJSONBody,
} from "@discordjs/core";
import { ApplicationCommandType, ButtonStyle, ComponentType } from "@discordjs/core";
import { z } from "zod";
import { pendingMembers } from "../../globalState/members";
import { logger } from "../../logger";
import { Snowflake } from "../../schemas";
import { embedFromMembers } from "../../utils/embed";
import { Status } from "../../utils/embed/status";

export const command: RESTPutAPIApplicationGuildCommandsJSONBody[number] = {
  type: ApplicationCommandType.ChatInput,
  name: "sondage",
  description: "Créer un sondage d'effectifs",
};

export const Data = z.object({
  id: Snowflake,
  token: z.string(),
  guild_id: Snowflake,
  data: z.object({ type: z.literal(ApplicationCommandType.ChatInput), name: z.literal("sondage") }),
});
type Data = z.infer<typeof Data>;

const components = [
  {
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        emoji: { name: Status.Ok },
        custom_id: Status.Ok,
      },
      {
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        emoji: { name: Status.Perhaps },
        custom_id: Status.Perhaps,
      },
      {
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        emoji: { name: Status.No },
        custom_id: Status.No,
      },
      {
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        emoji: { name: "💬" },
        custom_id: "tagPending",
      },
    ],
  },
] satisfies Array<APIActionRowComponent<APIMessageActionRowComponent>>;

export async function handleCreateSurveyCommand(api: API, data: Data): Promise<void> {
  logger.debug(data, "creating a survey");
  await api.interactions.reply(data.id, data.token, {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    embeds: [embedFromMembers(pendingMembers[data.guild_id]!)],
    components,
  });
}
