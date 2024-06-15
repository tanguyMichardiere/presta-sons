import type { ManagerShardEventsMap } from "@discordjs/core";
import { logger, type Logger } from "../logger";

type Opts = {
	logEvent: boolean;
};

/** Create an event handler, with logging and error handling */
export function createEventHandler<K extends keyof ManagerShardEventsMap>(
	eventName: K,
	listener: (args: ManagerShardEventsMap[K][0], logger: Logger) => void | Promise<void>,
	{ logEvent = true }: Partial<Opts> = {},
): (args: ManagerShardEventsMap[K][0]) => void {
	const childLogger = logger.child({ eventName });
	childLogger.info("registering a handler");
	return (args) => {
		if (logEvent) {
			logger.info({ event: args.data }, eventName);
		}
		try {
			const result = listener(args, childLogger);
			if (result instanceof Promise) {
				result.catch((reason) => {
					childLogger.error(reason);
				});
			}
		} catch (error) {
			childLogger.error(error);
		}
	};
}
