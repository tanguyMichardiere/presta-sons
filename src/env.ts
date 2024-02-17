import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { Snowflake } from "./schemas";

export default createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),

    DISCORD_TOKEN: z.string(),

    GUILD_ID: z.optional(Snowflake),
    ROLE_PREFIX: z.string().default("ps "),
    ADMIN_ROLE_NAME: z.string().default("Admin Presta'sons"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
