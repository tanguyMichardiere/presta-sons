import { Database } from "bun:sqlite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { schema } from "./schema";

const sqlite = new Database();
export const db = drizzle(sqlite, { schema });

db.run(sql`
	CREATE TABLE 'groups' (
		'id' integer PRIMARY KEY NOT NULL,
		'discord_id' text NOT NULL,
		'guild_id' text NOT NULL,
		'name' text NOT NULL
	)
`);
db.run(sql`
	CREATE TABLE 'members' (
		'id' integer PRIMARY KEY NOT NULL,
		'discord_id' text NOT NULL,
		'admin' integer NOT NULL,
		'group_id' integer NOT NULL,
		FOREIGN KEY ('group_id') REFERENCES 'groups'('id') ON UPDATE no action ON DELETE cascade
	)
`);
