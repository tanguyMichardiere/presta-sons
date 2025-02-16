import type { Snowflake } from "@discordjs/core";
import type { z } from "zod";

const _a: string & z.BRAND<"Snowflake"> = "" as Snowflake;
const _b: Snowflake = "" as string & z.BRAND<"Snowflake">;
