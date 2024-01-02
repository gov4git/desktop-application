CREATE TABLE `ballots_temp` (
  `id` integer PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`label` text NOT NULL,
	`communityUrl` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`choices` text NOT NULL,
	`choice` text NOT NULL,
	`score` real NOT NULL,
	`user` text NOT NULL,
  `status` text DEFAULT 'open' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ballots_identifier_communityUrl_unique` ON `ballots_temp` (`identifier`,`communityUrl`);
--> statement-breakpoint
INSERT INTO ballots_temp (identifier, label, communityUrl, title, description, choices, choice, score, user, status)
SELECT identifier, label, communityUrl, title, description, choices, choice, score, user, status from ballots;
--> statement-breakpoint
DROP TABLE ballots;
--> statement-breakpoint
ALTER TABLE ballots_temp RENAME TO ballots;
