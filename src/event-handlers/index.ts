import type { ManagerShardEventsMap } from "@discordjs/core";
import type { Db } from "../db";
import { db } from "../db";
import type { Logger } from "../logger";
import { logger } from "../logger";

type Options = {
	logEvent: boolean;
};

type ListenerOptions = {
	db: Db;
	logger: Logger;
};

/** Create an event handler, with logging and error handling */
export function createEventHandler<K extends keyof ManagerShardEventsMap>(
	eventName: K,
	listener: (args: ManagerShardEventsMap[K][0], opts: ListenerOptions) => Promise<void>,
	{ logEvent = true }: Partial<Options> = {},
): (args: ManagerShardEventsMap[K][0]) => Promise<void> {
	const childLogger = logger.child({ eventName });
	childLogger.info("registering a handler");
	return async (args) => {
		if (logEvent) {
			logger.info({ event: args.data }, eventName);
		}
		try {
			await db.transaction(async (tx) => {
				await listener(args, { db: tx, logger: childLogger });
			});
		} catch (error) {
			childLogger.error(error);
		}
	};
}
