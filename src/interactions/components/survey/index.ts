import type {
  API,
  APIEmbed,
  APIGuildMember,
  APIMessage,
  APIMessageInteraction,
  APIUser,
} from "@discordjs/core";
import { z } from "zod";
import { Snowflake } from "../../../schemas";
import {
  Data as TagPendingComponentInteractionData,
  handleTagPendingComponentInteraction,
} from "./tagPending";
import {
  Data as UpdateResultsComponentInteractionData,
  handleUpdateResultsComponentInteraction,
} from "./updateResults";

export const Data = z.object({
  id: Snowflake,
  token: z.string(),
  guild_id: Snowflake,
  message: z
    .custom<APIMessage>()
    .refine(
      (val): val is APIMessage & { interaction: APIMessageInteraction; embeds: [APIEmbed] } =>
        val.interaction !== undefined && val.embeds.length === 1,
    ),
  member: z
    .custom<APIGuildMember>()
    .refine((val): val is APIGuildMember & { user: APIUser } => val.user !== undefined),
  data: z.union([UpdateResultsComponentInteractionData, TagPendingComponentInteractionData]),
});
export type Data = z.infer<typeof Data>;

export async function handleSurveyComponentInteraction(api: API, data: Data): Promise<void> {
  if (data.data.custom_id === "tagPending") {
    await handleTagPendingComponentInteraction(api, data, data.data);
  } else {
    await handleUpdateResultsComponentInteraction(api, data, data.data);
  }
}
