CREATE TABLE `ballots` (
	`identifier` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`communityUrl` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`choices` text NOT NULL,
	`choice` text NOT NULL,
	`score` real NOT NULL,
	`user` text NOT NULL
);
