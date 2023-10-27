import type {
  APIGuildMember,
  APIMessageApplicationCommandInteractionDataResolved,
  APIUser,
} from "@discordjs/core";
import { ApplicationCommandType } from "@discordjs/core";
import { z } from "zod";
import { editSurveyCommandMessages } from "../../../messages";
import { Snowflake } from "../../../schemas";

export const EditSurveyCommandData = z.object({
  id: Snowflake,
  token: z.string(),
  application_id: Snowflake,
  guild_id: Snowflake,
  member: z
    .custom<APIGuildMember>((val) => val !== undefined)
    .refine((val): val is APIGuildMember & { user: APIUser } => val.user !== undefined),
  data: z
    .object({
      type: z.literal(ApplicationCommandType.Message),
      name: z.literal(editSurveyCommandMessages.commandName),
      target_id: Snowflake,
      resolved: z.custom<APIMessageApplicationCommandInteractionDataResolved>(
        (val) => val !== undefined,
      ),
    })
    .refine((val) => val.target_id in val.resolved.messages),
});
export type EditSurveyCommandData = z.infer<typeof EditSurveyCommandData>;
