export const snowflakeFromTag = (tag: string): string => tag.slice(2, -1);

export const tagFromSnowflake = (snowflake: string): string => `<@${snowflake}>`;
