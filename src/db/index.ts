import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { logger } from "../logger";
// @ts-expect-error
import migrationFile from "./_migration.sql" with { type: "file" };
import { schema } from "./schema";

const sqlite = new Database();
sqlite.run("PRAGMA foreign_keys = ON;");
sqlite.run(await Bun.file(migrationFile).text());
logger.debug("successfully applied the database migration");

export const db = drizzle(sqlite, {
	schema,
	logger: {
		logQuery(query, params) {
			let index = 0;
			logger.debug(query.replaceAll("?", () => JSON.stringify(params[index++])));
		},
	},
});
export type Db = typeof db;
