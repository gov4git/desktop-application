CREATE TABLE `policies` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`communityUrl` text NOT NULL,
	`motionType` text NOT NULL,
	`description` text NOT NULL,
	`githubLabel` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `policies_title_communityUrl_unique` ON `policies` (`title`,`communityUrl`);