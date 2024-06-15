import type { KnipConfig } from "knip";

export default {
	ignore: ["src/**/*.test.ts"],
	ignoreDependencies: ["pino-pretty"],
} satisfies KnipConfig;
