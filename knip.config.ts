import type { KnipConfig } from "knip";

export default {
	ignore: ["src/**/*.test.ts"],
	ignoreBinaries: ["sed"],
	ignoreDependencies: ["pino-pretty"],
} satisfies KnipConfig;
