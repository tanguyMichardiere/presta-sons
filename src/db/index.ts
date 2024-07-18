import { drizzle } from "drizzle-orm/bun-sqlite";
// @ts-expect-error
import sqlite from "./db.sqlite" with { type: "sqlite", embed: "true" };
import { schema } from "./schema";

export const db = drizzle(sqlite, { schema });
