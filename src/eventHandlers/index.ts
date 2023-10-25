import type { ManagerShardEventsMap } from "@discordjs/core";
import { logger } from "../logger";

type Opts = {
  logEvent: boolean;
};

/** Create an event handler, with logging and error handling */
export function createEventHandler<K extends keyof ManagerShardEventsMap>(
  eventName: K,
  listener: (args: ManagerShardEventsMap[K][0]) => void | Promise<void>,
  { logEvent = true }: Partial<Opts> = {},
): (args: ManagerShardEventsMap[K][0]) => void {
  logger.info({ logEvent }, `registering a handler for event ${eventName}`);
  return function (args) {
    if (logEvent) {
      logger.info(args.data, eventName);
    }
    try {
      const result = listener(args);
      if (result instanceof Promise) {
        result.catch(logger.error.bind(logger));
      }
    } catch (error) {
      logger.error(error);
    }
  };
}
