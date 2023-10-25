import { loadEnvConfig } from "@next/env";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { Snowflake } from "./schemas";

loadEnvConfig(process.cwd());

export default createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),

    APPLICATION_ID: Snowflake,
    DISCORD_TOKEN: z.string(),

    GUILD_ID: Snowflake,
    FORUM_ID: Snowflake,
    ROLE_PREFIX: z.string().default("ps "),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
