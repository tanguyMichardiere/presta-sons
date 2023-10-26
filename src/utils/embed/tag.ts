export const idFromTag = (tag: string): string => tag.slice(2, -1);

export const tagFromId = (id: string): string => `<@${id}>`;
