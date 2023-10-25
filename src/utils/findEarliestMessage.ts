import type { API, APIMessage } from "@discordjs/core";
import env from "../env";

/**
 * @returns The earliest message from the bot in a given channel (typically the survey message in a
 *   thread)
 */
export async function findEarliestMessage(api: API, threadId: string): Promise<APIMessage> {
  // we can't retrieve just the first few messages, we have to retrieve basically all messages in the thread...
  let messages = await api.channels.getMessages(threadId, { limit: 100 });
  let earliestMessage = messages.findLast((message) => message.author.id === env.APPLICATION_ID);
  while (messages.length === 100) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    messages = await api.channels.getMessages(threadId, { limit: 100, before: messages[99]!.id });
    earliestMessage =
      messages.findLast((message) => message.author.id === env.APPLICATION_ID) ?? earliestMessage;
  }
  if (earliestMessage === undefined) {
    throw new Error("Message not found");
  }
  return earliestMessage;
}
