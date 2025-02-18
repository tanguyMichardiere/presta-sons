CREATE TABLE `group_members` (
	`id` integer PRIMARY KEY NOT NULL,
	`member_id` integer NOT NULL,
	`group_id` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `group_members_idx` ON `group_members` (`member_id`,`group_id`);--> statement-breakpoint
CREATE TABLE `groups` (
	`id` integer PRIMARY KEY NOT NULL,
	`snowflake` text NOT NULL,
	`guild_id` integer NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `groups_snowflake_idx` ON `groups` (`snowflake`);--> statement-breakpoint
CREATE INDEX `groups_guild_id_idx` ON `groups` (`guild_id`);--> statement-breakpoint
CREATE TABLE `guilds` (
	`id` integer PRIMARY KEY NOT NULL,
	`snowflake` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guilds_snowflake_idx` ON `guilds` (`snowflake`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`guild_id` integer NOT NULL,
	`admin` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_idx` ON `members` (`user_id`,`guild_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`snowflake` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_snowflake_idx` ON `users` (`snowflake`);