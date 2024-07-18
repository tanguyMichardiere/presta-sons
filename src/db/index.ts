import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { logger } from "../logger";
// @ts-expect-error
import migrationFile from "./_migration.sql" with { type: "file" };
import { schema } from "./schema";

const sqlite = new Database();
sqlite.run(await Bun.file(migrationFile).text());

export const db = drizzle(sqlite, {
	schema,
	logger: {
		logQuery(query, params) {
			logger.debug(params, query);
		},
	},
});
