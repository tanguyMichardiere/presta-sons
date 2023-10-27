import type {
  APIGuildMember,
  APIMessageApplicationCommandInteractionDataResolved,
  APIUser,
} from "@discordjs/core";
import { ApplicationCommandType } from "@discordjs/core";
import { z } from "zod";
import { tagPendingCommandMessages } from "../../../messages";
import { Snowflake } from "../../../schemas";

export const TagPendingCommandData = z.object({
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
      name: z.literal(tagPendingCommandMessages.commandName),
      target_id: Snowflake,
      resolved: z.custom<APIMessageApplicationCommandInteractionDataResolved>(
        (val) => val !== undefined,
      ),
    })
    .refine((val) => val.target_id in val.resolved.messages),
});
export type TagPendingCommandData = z.infer<typeof TagPendingCommandData>;
