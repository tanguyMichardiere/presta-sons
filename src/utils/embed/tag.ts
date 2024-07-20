import type { Snowflake } from "@discordjs/core";

export const snowflakeFromTag = (tag: string): Snowflake => tag.slice(2, -1) as Snowflake;

export const tagFromSnowflake = (snowflake: Snowflake): string => `<@${snowflake}>`;
