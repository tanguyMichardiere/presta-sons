import { loadEnvConfig } from "@next/env";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

loadEnvConfig(process.cwd());

export default createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),

    DISCORD_TOKEN: z.string(),

    ROLE_PREFIX: z.string().default("ps "),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
