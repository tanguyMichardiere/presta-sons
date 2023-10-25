import type { ManagerShardEventsMap } from "@discordjs/core";
import env from "../env";
import { logger } from "../logger";

type Opts = {
  logEvent: boolean;
};

/** Create an event handler, with logging and error handling */
export const createEventHandler = <K extends keyof ManagerShardEventsMap>(
  eventName: K,
  listener: (args: ManagerShardEventsMap[K][0]) => void | Promise<void>,
  { logEvent = true }: Partial<Opts> = {},
): ((args: ManagerShardEventsMap[K][0]) => void) =>
  function (args) {
    if (!("guild_id" in args.data) || args.data.guild_id === env.GUILD_ID) {
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
    }
  };
