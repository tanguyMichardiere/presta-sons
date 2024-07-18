CREATE TABLE `groups` (
	`id` integer PRIMARY KEY NOT NULL,
	`discord_id` text NOT NULL,
	`guild_id` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` integer PRIMARY KEY NOT NULL,
	`discord_id` text NOT NULL,
	`admin` integer NOT NULL,
	`group_id` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade
);
