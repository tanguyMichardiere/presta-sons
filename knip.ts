import type { KnipConfig } from "knip";

export default {
  ignore: ["src/**/*.test.ts"],
  ignoreBinaries: ["glob"],
  ignoreDependencies: ["node-glob", "npm-check-updates", "pino-pretty"],
} satisfies KnipConfig;
