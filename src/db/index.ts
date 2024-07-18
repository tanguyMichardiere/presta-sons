import { Database } from "bun:sqlite";
// biome-ignore lint/nursery/noUndeclaredDependencies: <explanation>
import { file } from "bun";
import { drizzle } from "drizzle-orm/bun-sqlite";
// @ts-expect-error
import migrationFile from "./_migration.sql" with { type: "file" };
import { schema } from "./schema";

const sqlite = new Database();
sqlite.run(await file(migrationFile).text());

export const db = drizzle(sqlite, { schema });
