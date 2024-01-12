import type { KnipConfig } from "knip";

export default {
  ignore: ["src/**/*.test.ts"],
  ignoreDependencies: ["npm-check-updates", "pino-pretty"],
} satisfies KnipConfig;
