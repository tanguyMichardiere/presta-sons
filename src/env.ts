import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { SnowflakeSchema } from "./schemas";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
		LOG_LEVEL: z.enum(["error", "warn", "info", "debug", "silent"]).default("info"),

		DISCORD_TOKEN: z.string(),

		GUILD_ID: z.optional(SnowflakeSchema),
		ROLE_PREFIX: z.string().default("ps "),
		ADMIN_ROLE_NAME: z.string().default("Admin Presta'sons"),
	},
	// biome-ignore lint/nursery/noProcessEnv: checked by t3env
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
