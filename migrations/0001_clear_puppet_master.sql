CREATE TABLE `configStore` (
	`id` integer PRIMARY KEY NOT NULL,
	`communityUrl` text NOT NULL,
	`path` text NOT NULL,
	`name` text NOT NULL,
	`projectUrl` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `configs` (
	`communityUrl` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`path` text NOT NULL,
	`projectUrl` text NOT NULL
);
