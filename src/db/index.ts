import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { logger } from "../logger";
// @ts-expect-error
import migration from "./_migration.sql" with { type: "text" };
import { schema } from "./schema";

const sqlite = new Database();
sqlite.run("PRAGMA foreign_keys = ON;");
sqlite.run(migration);
logger.debug("successfully applied the database migration");

export const db = drizzle(sqlite, {
	schema,
	logger: {
		logQuery(query, params): void {
			let index = 0;
			logger.debug(query.replaceAll("?", () => JSON.stringify(params[index++])));
		},
	},
});
export type Db = Omit<typeof db, "$client">;
