CREATE TABLE `group_members` (
	`id` integer PRIMARY KEY NOT NULL,
	`group_id` integer NOT NULL,
	`member_id` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` integer PRIMARY KEY NOT NULL,
	`discord_id` text NOT NULL,
	`guild_id` integer NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `guilds` (
	`id` integer PRIMARY KEY NOT NULL,
	`discord_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` integer PRIMARY KEY NOT NULL,
	`discord_id` text NOT NULL,
	`guild_id` integer NOT NULL,
	`admin` integer NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `group_members_idx` ON `group_members` (`group_id`,`member_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `groups_discord_id_idx` ON `groups` (`discord_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `guilds_discord_id_idx` ON `guilds` (`discord_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `members_discord_id_idx` ON `members` (`discord_id`);