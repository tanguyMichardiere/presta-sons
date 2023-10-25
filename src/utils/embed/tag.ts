export const idFromTag = (tag: string): string => tag.slice(2, 20);

export const tagFromId = (id: string): string => `<@${id}>`;
