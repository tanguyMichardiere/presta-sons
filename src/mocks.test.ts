import { mock } from "bun:test";

await mock.module("./env", () => ({
  default: {
    NODE_ENV: "test",
    LOG_LEVEL: "silent",

    DISCORD_TOKEN: "",

    ROLE_PREFIX: "ps ",
    ADMIN_ROLE_NAME: "Admin Presta'sons",
  },
}));
