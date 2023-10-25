import { z } from "zod";

export const Snowflake = z.string().refine((val) => BigInt(val).toString() === val);
export type Snowflake = z.infer<typeof Snowflake>;
