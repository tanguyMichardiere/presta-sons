import { z } from "zod";

// we allow snowflakes of 17 to 21 digits
export const snowflakeRegex = /[1-9]\d{16,20}/;

export const Snowflake = z.string().regex(snowflakeRegex);
export type Snowflake = z.infer<typeof Snowflake>;
