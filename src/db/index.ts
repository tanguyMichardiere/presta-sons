import { drizzle } from "drizzle-orm/bun-sqlite";
import { logger } from "../logger";
// @ts-expect-error
import sqlite from "./db.sqlite" with { type: "sqlite", embed: "true" };
import { schema } from "./schema";

export const db = drizzle(sqlite, { schema });

logger.info(JSON.stringify(sqlite));
