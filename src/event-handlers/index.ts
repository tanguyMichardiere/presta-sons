import type { ManagerShardEventsMap } from "@discordjs/core";
import type { Db } from "../db";
import { db } from "../db";
import type { Logger } from "../logger";
import { logger } from "../logger";

/** Create an event handler, with logging and error handling */
export function createEventHandler<K extends keyof ManagerShardEventsMap>(
	eventName: K,
	listener: (args: ManagerShardEventsMap[K][0], opts: { db: Db; logger: Logger }) => Promise<void>,
	{ logEvent = true }: { logEvent?: boolean } = {},
): (args: ManagerShardEventsMap[K][0]) => Promise<void> {
	const childLogger = logger.child({ eventName });
	childLogger.info("registering a handler");
	return async (args): Promise<void> => {
		if (logEvent) {
			logger.info({ event: args.data }, eventName);
		}
		try {
			await db.transaction(async (tx) => {
				// @ts-expect-error
				await listener(args, { db: tx, logger: childLogger });
			});
		} catch (error) {
			childLogger.error(error);
		}
	};
}
