import { Database } from "bun:sqlite";
// biome-ignore lint/nursery/noUndeclaredDependencies:
import { file } from "bun";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
// @ts-expect-error
import migration from "./_migration.sql" with { type: "file" };
import { schema } from "./schema";

const sqlite = new Database();
export const db = drizzle(sqlite, { schema });

const migrationScript = await file(migration).text();
for (const migrationStatement of migrationScript.split(";").slice(0, -1)) {
	db.run(sql.raw(migrationStatement));
}
