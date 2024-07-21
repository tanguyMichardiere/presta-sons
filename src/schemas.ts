import type { Snowflake } from "@discordjs/core";
import { z } from "zod";

// we allow snowflakes of 17 to 21 digits
export const snowflakeRegex = /[1-9]\d{16,20}/;

export const SnowflakeSchema: z.ZodType<Snowflake, z.ZodBrandedDef<z.ZodString>, string> = z
	.string()
	.regex(snowflakeRegex)
	.brand("Snowflake");
